/* global print, ARGUMENTS, */
// these come from makedata.js / checkdata.js / cleardata.js:
/* global _, fs, enterprise, db, database, isCluster, progress, time */
// these are our state variables, we need to write them:
/* global tStart:true, timeLine:true */
//
const AsciiTable = require('ascii-table');

function isCharDigit(n){
  return !!n.trim() && n > -1;
}

function scanMakeDataPaths (options, PWD, oldVersion, newVersion, wantFunctions, nameString, excludePreviouslyExecuted) {
  var EXECUTED_TEST_SUITES_FILE = "";
  var previously_executed_suites = [];
  if(excludePreviouslyExecuted) {
    EXECUTED_TEST_SUITES_FILE = fs.join(options.tempDataDir, "executed_test_suites.json");
    if(!fs.exists(options.tempDataDir)){
      fs.makeDirectoryRecursive(options.tempDataDir);
    }
    
    try {
      previously_executed_suites = JSON.parse(fs.read(EXECUTED_TEST_SUITES_FILE));
    } catch (exception) { } 
  }

  let tableColumnHeaders = [
    "DB", "loop", "testname"
  ];
  let resultTable = new AsciiTable("");
  resultTable.setHeading(tableColumnHeaders);

  let fns = [[],[]];
  const FNChars = [ 'D', 'L'];
  let filters = [];
  if (options.hasOwnProperty('test') && (typeof (options.test) !== 'undefined')) {
    filters = options.test.split(',');
  }
  let testDir = fs.join(PWD, 'makedata_suites');
  let suites = _.filter(
    fs.list(testDir),
    function (p) {
      if (!isCharDigit(p.charAt(0))) {
        return false;
      }
      if (filters.length > 0) {
        let found = false;
        filters.forEach(flt => {
          if (p.search(flt) >= 0) {
            found = true;
          }
        });
        if (!found) {
          return false;
        }
      }
      return (p.substr(-3) === '.js');
    }).map(function (x) {
      return fs.join(fs.join(PWD, 'makedata_suites'), x);
    }).sort();
  var executed_suites = [];
  suites.forEach(suitePath => {
    let column = [];
    let supported = "";
    let unsupported = "";
    let pseg = suitePath.split(fs.pathSeparator);
    let suite_filename = pseg[pseg.length - 1];    
    let suite = require("internal").load(suitePath);
    if (suite.isSupported(oldVersion, newVersion, options, enterprise, isCluster)) {
      let count = 0;
      wantFunctions.forEach(fn => {
        if (wantFunctions[count] in suite) {
          column.push(' X');
          supported += FNChars[count];
          if(!(previously_executed_suites.includes(suite_filename)) || !excludePreviouslyExecuted){
            fns[count].push(suite[fn]);
            executed_suites.push(suite_filename);
          }
        } else {
          column.push(' ');
          unsupported += " ";
        }
        count += 1;
      });
    } else {
      column.push(' ');
      column.push(' ');
      supported = " ";
      unsupported = " ";
    }
    column.push(suite_filename);
    resultTable.addRow(column);
  });
  if(excludePreviouslyExecuted){
    executed_suites.forEach(suite=> {previously_executed_suites.push(suite)});
    fs.write(EXECUTED_TEST_SUITES_FILE, JSON.stringify(previously_executed_suites));
  }
  print(resultTable.toString());
  print(` in ${testDir}`);
  return fns;
}

function mainTestLoop(options, isCluster, enterprise, fns, endOfLoopFN) {
  let dbCount = 0;
  while (dbCount < options.numberOfDBs) {
    tStart = time();
    timeLine = [tStart];
    fns[0].forEach(func => {
      db._useDatabase("_system");
      func(options,
           isCluster,
           enterprise,
           database,
           dbCount);
    });

    let loopCount = options.collectionCountOffset;
    while (loopCount < options.collectionMultiplier) {
      progress('inner Loop start');
      fns[1].forEach(func => {
        func(options,
             isCluster,
             enterprise,
             dbCount,
             loopCount);
      });

      progress('inner Loop End');
      loopCount ++;
    }
    progress('outer loop end');

    endOfLoopFN(database);
    if (options.printTimeMeasurement) {
      print(timeLine.join());
    }
    dbCount++;
  }
}

function getMetricValue (text, name) {
  let re = new RegExp("^" + name);
  let matches = text.split('\n').filter((line) => !line.match(/^#/)).filter((line) => line.match(re));
  if (!matches.length) {
    throw "Metric " + name + " not found";
  }
  return Number(matches[0].replace(/^.*{.*}([0-9. ]+)$/, "$1"));
}

exports.scanMakeDataPaths = scanMakeDataPaths;
exports.mainTestLoop = mainTestLoop;
exports.getMetricValue = getMetricValue;
