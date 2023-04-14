/* global print, progress, createCollectionSafe, db, createSafe  */
const analyzers = require("@arangodb/analyzers");

function deleteAnalyzer_400(testgroup, analyzerName){
  try {
    const array = analyzers.toArray();
    for (let i = 0; i < array.length; i++) {
      const name = array[i].name().replace('_system::', '');
      if (name === analyzerName) {
        analyzers.remove(analyzerName);
      }
    }
    // checking created analyzer is deleted or not
    if (analyzers.analyzer(analyzerName) != null) {
      throw new Error(`${testgroup}: ${analyzerName} analyzer isn't deleted yet!`);
    }
  } catch (e) {
    print(e);
    throw new e;
  }
  progress(`${testgroup}: deleted ${analyzerName}`);
}

(function () {
  const {
    getMetricValue
  } = require(fs.join(PWD, 'common'));
  

  let arangosearchTestCases = [
    {
      "collectionName": "no_cache",
      "link": {
        "utilizeCache": false, // This value is for testing purpose. It will be ignored during link creation
        includeAllFields: false,
        storeValues: "none",
        trackListPositions: false,
        fields: {
          animal: {},
          name: {}
        },
        "analyzers": ["AqlAnalyzerHash"]
      }
    },
    {
      "collectionName": "cache_true_top",
      "link": {
        "cache": true,
        "utilizeCache": true, // This value is for testing purpose. It will be ignored during link creation
        includeAllFields: false,
        storeValues: "none",
        trackListPositions: false,
        fields: {
          animal: {},
          name: {}
        },
        "analyzers": ["AqlAnalyzerHash"]
      }
    },
    {
      "collectionName": "cache_false_top",
      "link": {
        "cache": false,
        "utilizeCache": false, // This value is for testing purpose. It will be ignored during link creation
        includeAllFields: false,
        storeValues: "none",
        trackListPositions: false,
        fields: {
          animal: {},
          name: {}
        },
        "analyzers": ["AqlAnalyzerHash"]
      }
    },
    {
      "collectionName": "cache_true_bottom",
      "link": {
        "utilizeCache": true, // This value is for testing purpose. It will be ignored during link creation
        includeAllFields: false,
        storeValues: "none",
        trackListPositions: false,
        fields: {
          animal: {
            "cache": true,
          },
          name: {}
        },
        "analyzers": ["AqlAnalyzerHash"]
      }
    },
    {
      "collectionName": "cache_false_bottom",
      "link": {
        "utilizeCache": false, // This value is for testing purpose. It will be ignored during link creation
        includeAllFields: false,
        storeValues: "none",
        trackListPositions: false,
        fields: {
          animal: {
            "cache": false,
          },
          name: {}
        },
        "analyzers": ["AqlAnalyzerHash"]
      }
    },
    {
      "collectionName": "cache_true_top_true_bottom",
      "link": {
        "utilizeCache": true, // This value is for testing purpose. It will be ignored during link creation
        "cache": true,
        includeAllFields: false,
        storeValues: "none",
        trackListPositions: false,
        fields: {
          animal: {
            "cache": true,
          },
          name: {}
        },
        "analyzers": ["AqlAnalyzerHash"]
      }
    },
    {
      "collectionName": "cache_true_top_false_bottom",
      "link": {
        "utilizeCache": true, // This value is for testing purpose. It will be ignored during link creation
        "cache": true,
        includeAllFields: false,
        storeValues: "none",
        trackListPositions: false,
        fields: {
          animal: {
            "cache": false,
          },
          name: {}
        },
        "analyzers": ["AqlAnalyzerHash"]
      }
    },
    {
      "collectionName": "cache_false_top_true_bottom",
      "link": {
        "utilizeCache": true, // This value is for testing purpose. It will be ignored during link creation
        "cache": false,
        includeAllFields: false,
        storeValues: "none",
        trackListPositions: false,
        fields: {
          animal: {
            "cache": true,
          },
          name: {}
        },
        "analyzers": ["AqlAnalyzerHash"]
      }
    },
    {
      "collectionName": "cache_false_top_false_bottom",
      "link": {
        "utilizeCache": false, // This value is for testing purpose. It will be ignored during link creation
        "cache": false,
        includeAllFields: false,
        storeValues: "none",
        trackListPositions: false,
        fields: {
          animal: {
            "cache": false,
          },
          name: {}
        },
        "analyzers": ["AqlAnalyzerHash"]
      }
    },
    {
      "collectionName": "cache_top_true_geojson",
      "link": {
        "utilizeCache": true, // This value is for testing purpose. It will be ignored during link creation
        "cache": true,
        includeAllFields: false,
        storeValues: "none",
        trackListPositions: false,
        "fields": {
          "geo_location": {
            "analyzers": ["geo_json"]
          }
        },
        "analyzers": ["AqlAnalyzerHash"]
      }
    },
    {
      "collectionName": "cache_bottom_true_geojson",
      "link": {
        "utilizeCache": true, // This value is for testing purpose. It will be ignored during link creation
        includeAllFields: false,
        storeValues: "none",
        trackListPositions: false,
        "fields": {
          "geo_location": {
            "analyzers": ["geo_json"],
            "cache": true
          }
        },
        "analyzers": ["AqlAnalyzerHash"]
      }
    },
    {
      "collectionName": "cache_top_true_geopoint",
      "link": {
        "utilizeCache": true, // This value is for testing purpose. It will be ignored during link creation
        "cache": true,
        includeAllFields: false,
        storeValues: "none",
        trackListPositions: false,
        "fields": {
          "geo_latlng": {
            "analyzers": ["geo_point"]
          }
        },
        "analyzers": ["AqlAnalyzerHash"]
      }
    },
    {
      "collectionName": "cache_bottom_true_geopoint",
      "link": {
        "utilizeCache": true, // This value is for testing purpose. It will be ignored during link creation
        includeAllFields: false,
        storeValues: "none",
        trackListPositions: false,
        "fields": {
          "geo_latlng": {
            "analyzers": ["geo_point"],
            "cache": true
          }
        },
        "analyzers": ["AqlAnalyzerHash"]
      }
    }
  ];

  let invertedIndexTestCases = [
    {
      "collectionName": "no_cache",
      "utilizeCache": false,
      "cache": false,
      "type": "inverted",
      "name": "inverted",
      "analyzer": "AqlAnalyzerHash",
      "includeAllFields": false,
      "trackListPositions": false,
      "fields": [
        {
          "name": "animal",
          "cache": false
        },
        {
          "name": "name"
        }
      ],
      "storedValues": [
        {
          "fields": [ "name", "animal"],
          "cache": false,
          "compression": "lz4"
        }
      ],
      "primaryKeyCache": false,
      "primarySort": {
        "fields": [
          { "field": "name", "asc": true },
          { "field": "animal", "asc": false }
        ],
        "cache": false,
        "compression": "lz4"
      }
    },
    {
      "collectionName": "cache_true_top",
      "utilizeCache": true,
      "cache": true,
      "type": "inverted",
      "name": "inverted",
      "analyzer": "AqlAnalyzerHash",
      "includeAllFields": false,
      "trackListPositions": false,
      "fields": [
        {
          "name": "animal"
        },
        {
          "name": "name"
        }
      ]
    },
    {
      "collectionName": "cache_false_top",
      "utilizeCache": false,
      "cache": false,
      "type": "inverted",
      "name": "inverted",
      "analyzer": "AqlAnalyzerHash",
      "includeAllFields": false,
      "trackListPositions": false,
      "fields": [
        {
          "name": "animal"
        },
        {
          "name": "name"
        }
      ]
    },
    {
      "collectionName": "cache_true_bottom",
      "utilizeCache": true,
      "type": "inverted",
      "name": "inverted",
      "analyzer": "AqlAnalyzerHash",
      "includeAllFields": false,
      "trackListPositions": false,
      "searchField": false,
      "fields": [
        {
          "name": "animal",
          "cache": true
        },
        {
          "name": "name"
        }
      ]
    },
    {
      "collectionName": "cache_false_bottom",
      "utilizeCache": false,
      "type": "inverted",
      "name": "inverted",
      "analyzer": "AqlAnalyzerHash",
      "includeAllFields": false,
      "trackListPositions": false,
      "searchField": false,
      "fields": [
        {
          "name": "animal",
          "cache": false
        },
        {
          "name": "name"
        }
      ]
    },
    {
      "collectionName": "cache_true_top_true_bottom",
      "utilizeCache": true,
      "cache": true,
      "type": "inverted",
      "name": "inverted",
      "analyzer": "AqlAnalyzerHash",
      "includeAllFields": false,
      "trackListPositions": false,
      "searchField": false,
      "fields": [
        {
          "name": "animal",
          "cache": true
        },
        {
          "name": "name"
        }
      ]
    },
    {
      "collectionName": "cache_true_top_false_bottom",
      "utilizeCache": true,
      "cache": true,
      "type": "inverted",
      "name": "inverted",
      "analyzer": "AqlAnalyzerHash",
      "includeAllFields": false,
      "trackListPositions": false,
      "searchField": false,
      "fields": [
        {
          "name": "animal",
          "cache": false
        },
        {
          "name": "name"
        }
      ]
    },
    {
      "collectionName": "cache_false_top_true_bottom",
      "utilizeCache": true,
      "cache": false,
      "type": "inverted",
      "name": "inverted",
      "analyzer": "AqlAnalyzerHash",
      "includeAllFields": false,
      "trackListPositions": false,
      "searchField": false,
      "fields": [
        {
          "name": "animal",
          "cache": true
        },
        {
          "name": "name"
        }
      ]
    },
    {
      "collectionName": "cache_false_top_false_bottom",
      "utilizeCache": false,
      "cache": false,
      "type": "inverted",
      "name": "inverted",
      "analyzer": "AqlAnalyzerHash",
      "includeAllFields": false,
      "trackListPositions": false,
      "searchField": false,
      "fields": [
        {
          "name": "animal",
          "cache": false
        },
        {
          "name": "name"
        }
      ]
    },
    {
      "collectionName": "cache_top_true_geojson",
      "utilizeCache": true,
      "cache": true,
      "type": "inverted",
      "name": "inverted",
      "analyzer": "AqlAnalyzerHash",
      "includeAllFields": false,
      "trackListPositions": false,
      "searchField": false,
      "fields": [
        {
          "name": "geo_location",
          "analyzer": "geo_json"
        }
      ]
    },
    {
      "collectionName": "cache_bottom_true_geojson",
      "utilizeCache": true,
      "type": "inverted",
      "name": "inverted",
      "analyzer": "AqlAnalyzerHash",
      "includeAllFields": false,
      "trackListPositions": false,
      "searchField": false,
      "fields": [
        {
          "name": "geo_location",
          "analyzer": "geo_json",
          "cache": true
        }
      ]
    },
    {
      "collectionName": "cache_top_true_geopoint",
      "utilizeCache": true,
      "cache": true,
      "type": "inverted",
      "name": "inverted",
      "analyzer": "AqlAnalyzerHash",
      "includeAllFields": false,
      "trackListPositions": false,
      "searchField": false,
      "fields": [
        {
          "name": "geo_latlng",
          "analyzer": "geo_point"
        }
      ]
    },
    {
      "collectionName": "cache_bottom_true_geopoint",
      "utilizeCache": true,
      "type": "inverted",
      "name": "inverted",
      "analyzer": "AqlAnalyzerHash",
      "includeAllFields": false,
      "trackListPositions": false,
      "searchField": false,
      "fields": [
        {
          "name": "geo_latlng",
          "analyzer": "geo_point",
          "cache": true
        }
      ]
    },
    {
      "collectionName": "ps_cache",
      "utilizeCache": true,
      "type": "inverted",
      "name": "inverted",
      "analyzer": "AqlAnalyzerHash",
      "includeAllFields": false,
      "trackListPositions": false,
      "fields": [
        {
          "name": "animal"
        },
        {
          "name": "name"
        }
      ],
      "primarySort": {
        "fields": [
          { "field": "name", "asc": true },
          { "field": "animal", "asc": false }
        ],
        "cache": true
      }
    },
    {
      "collectionName": "sv_cache",
      "utilizeCache": true,
      "type": "inverted",
      "name": "inverted",
      "analyzer": "AqlAnalyzerHash",
      "includeAllFields": false,
      "trackListPositions": false,
      "fields": [
        {
          "name": "animal"
        },
        {
          "name": "name"
        }
      ],
      "primarySort": {
        "fields": [
          { "field": "name", "asc": true },
          { "field": "animal", "asc": false }
        ]
      },
      "storedValues": [
        {
          "fields": [ "title", "categories"],
          "cache": true
        }
      ]
    },
    {
      "collectionName": "pk_cache",
      "utilizeCache": true,
      "type": "inverted",
      "name": "inverted",
      "analyzer": "AqlAnalyzerHash",
      "includeAllFields": false,
      "trackListPositions": false,
      "fields": [
        {
          "name": "animal"
        },
        {
          "name": "name"
        }
      ],
      "primarySort": {
        "fields": [
          { "field": "name", "asc": true },
          { "field": "animal", "asc": false }
        ],
        "cache": false
      },
      "storedValues": [
        {
          "fields": [ "title", "categories"],
          "cache": false
        }
      ],
      "primaryKeyCache": true
    },
  ];

  let simulateNormalization = function (definition, type) {
    // This function will simulate field normalization inside link/index definition.
    /*
    5 possible cases when we should omit 'cache' value from link/index definition:
          1) ____                2)  ___
                 ____                  'cache': false
  
  
          3)'cache': false    4) 'cache': false     5) 'cache': true
                  ____               'cache': false         'cache': true
    */

    let result = definition;
    let has_animal = undefined;
    let animal_field = undefined;
    if (type == "arangosearch") {
      has_animal = result["fields"].hasOwnProperty("animal");
      if (has_animal) {
        animal_field = result["fields"]["animal"];
      }
    } else if (type == "index") {
      has_animal = result["fields"][0]["name"] == "animal";
      if (has_animal) {
        animal_field = result["fields"][0];
      }
      if (result.hasOwnProperty("primarySort")) {
        if (result["primarySort"].hasOwnProperty("cache")) {
          if (result["primarySort"]["cache"] == false) {
            delete result["primarySort"]["cache"];
          }
        }
      }
      if (result.hasOwnProperty("storedValues")) {
        if (result["storedValues"][0].hasOwnProperty("cache")) {
          if (result["storedValues"][0]["cache"] == false) {
            delete result["storedValues"][0]["cache"];
          }
        }
      }
      if (result.hasOwnProperty("primaryKeyCache")) {
        if (result["primaryKeyCache"] == false) {
          delete result["primaryKeyCache"];
        }
      }
    } else {
      throw Error(`Unexpected type of definition: ${definition}`)
    }

    // remove 'cache' values from link/index definition
    if (result.hasOwnProperty("cache")) {
      if (has_animal) {
        if (result["cache"] == false) {
          if (animal_field.hasOwnProperty("cache")) {
            if (animal_field["cache"] == false) {
              delete result["cache"];
              delete animal_field["cache"];
            } else {
              delete result["cache"];
            }
          } else {
            delete result["cache"];
          }
        } else {
          if (animal_field.hasOwnProperty("cache")) {
            if (animal_field["cache"] == true) {
              delete animal_field["cache"];
            }
          }
        }
      }
    } else {
      if (has_animal) {
        if (animal_field.hasOwnProperty("cache")) {
          if (animal_field["cache"] == false) {
            delete animal_field["cache"];
          }
        }
      }
    }

    return result;
  };

  let removeCacheFields = function (definition, type) {
    // This function will simulate field normalization when 'cache' field is not supported
    // i.e. it will be simply ommited everywhere

    let result = definition;
    let has_animal = undefined;
    let animal_field = undefined;
    if (type == "arangosearch") {
      has_animal = result["fields"].hasOwnProperty("animal");
      if (has_animal) {
        animal_field = result["fields"]["animal"];
      }
    } else if (type == "index") {
      has_animal = result["fields"][0]["name"] == "animal";
      if (has_animal) {
        animal_field = result["fields"][0];
      }
      if (result.hasOwnProperty("primarySort")) {
        if (result["primarySort"].hasOwnProperty("cache")) {
          delete result["primarySort"]["cache"];
        }
      }
      if (result.hasOwnProperty("storedValues")) {
        if (result["storedValues"][0].hasOwnProperty("cache")) {
          delete result["storedValues"][0]["cache"];
        }
      }
      if (result.hasOwnProperty("primaryKeyCache")) {
        delete result["primaryKeyCache"];
      }
    } else {
      throw new Error(`Unexpected type of definition: ${definition}`)
    }

    if (result.hasOwnProperty("cache")) {
      delete result["cache"];
    }
    if (has_animal) {
      if (animal_field.hasOwnProperty("cache")) {
        delete animal_field["cache"];
      }
    }
    return result;
  };

  let compare = function (cacheSizeSupported, type, actual, expectedRaw) {
    let expected;

    if (cacheSizeSupported) {
      expected = simulateNormalization(expectedRaw, type);
    } else {
      expected = removeCacheFields(expectedRaw, type);
    }

    // remove redundant 'utilizeCache' values. 
    delete expected["utilizeCache"];
    if (expected.hasOwnProperty("collectionName")) {
      delete expected["collectionName"];
    }

    // actual comparison
    if (type == "arangosearch") {
      return _.isEqual(actual, expected);
    } else if (type == "index") {
      // We want to be sure that 'cache' fields are exist or not exist simultaneously for 'actual' and 'expected' 
      let res = actual.hasOwnProperty("cache") ^ expected.hasOwnProperty("cache");
      return !res && _.isMatch(actual, expected);
    } else {
      throw Error(`Unsupported type ${type}`);
    }
  };

  let jwt_key = null;

  let generateJWT = function (options) {
    if (jwt_key != null) {
      return;
    }
    let headers = 'Content-Type: application/json';
    let content = `{"username": "root","password": "${options.passvoid}" }`;
    let reply = arango.POST_RAW("/_open/auth", content, headers);
    let obj = reply["parsedBody"];
    jwt_key = obj["jwt"];
  };

  let getRawMetrics = function (tags = "") {
    let headers = {};
    headers['accept'] = 'application/json';
    headers["Authorization"] = `Bearer ${jwt_key}`;
    let reply = arango.GET_RAW(`/_admin/metrics/v2${tags}`, headers);
    return reply;
  };

  let getMetricByName = function (name, tags) {
    let res = getRawMetrics(tags);
    if (res.code !== 200) {
      print(res);
      return 0;
    }
    return getMetricValue(res.body, name);
  };

  let getMetricSingle = function (name) {
    return getMetricByName(name, "");
  };

  let getMetricCluster = function (name) {
    {
      // trigger cluster metrics
      arango.GET_RAW("/_db/_system/_admin/metrics?mode=write_global", {accept: "application/json"});
      arango.GET_RAW("/_db/_system/_admin/metrics?mode=trigger_global", {accept: "application/json"});
      require("internal").sleep(0.2);
    }
    let headers = {};
    headers['accept'] = 'application/json';
    headers["Authorization"] = `Bearer ${jwt_key}`;
    let clusterHealth = arango.GET_RAW("/_admin/cluster/health", headers)["parsedBody"]["Health"];

    let serversId = [];
    for (let [key, value] of Object.entries(clusterHealth)) {
      if (value.Role.toLowerCase() == "dbserver") {
        serversId.push(key);
      }
    }

    let value = 0;
    for (let i = 0; i < serversId.length; i++) {
      value += getMetricByName(name, `?serverId=${serversId[i]}`);
    }

    return value;
  };

  let getMetric = function (name, options) {
    generateJWT(options);
    if (isCluster) {
      return getMetricCluster(name);
    } else {
      return getMetricSingle(name);
    }
  };

  let isCacheSizeSupported = function (version) {
    return semver.gte(version, "3.9.5") && semver.neq(version, "3.10.0") && semver.neq(version, "3.10.1");
  };
  return {
    isSupported: function (version, oldVersion, enterprise, cluster) {
      return semver.gte(version, '3.9.5');
    },
    makeData: function (options, isCluster, isEnterprise, dbCount, loopCount) {
      // All items created must contain dbCount and loopCount
      print(`making data ${dbCount} ${loopCount}`);

      let currVersion = db._version();

      // create analyzer with 'norm' feature
      analyzers.save("AqlAnalyzerHash", "aql", { "queryString": "return to_hex(to_string(@param))" }, ["frequency", "norm", "position"])
      analyzers.save("geo_json", "geojson", {}, ["frequency", "norm", "position"]);
      analyzers.save("geo_point", "geopoint", { "latitude": ["lat"], "longitude": ["lng"] }, ["frequency", "norm", "position"]);

      // create view with cache in 'storedValues'
      progress('createViewSVCache');
      let viewNameSVCache = `viewSVCache_${loopCount}`;
      let viewSVCache = createSafe(viewNameSVCache,
        viewNameSVCache => {
          return db._createView(viewNameSVCache, "arangosearch", { 
            "storedValues": [
              { "fields": ["animal", "name"], "cache": true }
            ] 
          });
        }, viewNameSVCache => {
          throw new Error(`Can't create view ${viewNameSVCache}`);
        }
      );

      // SHOULD BE UNCOMMENTED AFTER FIXING SEARCH-466
      // let viewPKCache = undefined;
      // if (semver.gte(currVersion, "3.9.6")) {
      //   // create view with cache in 'primaryKeyCache'
      //   progress('createViewPKCache');
      //   viewNamePKCache = `viewPKCache_${loopCount}`;
      //   viewPKCache = createSafe(viewNamePKCache,
      //     viewNamePKCache => {
      //       return db._createView(viewNamePKCache, "arangosearch", { 
      //         "primaryKeyCache": true
      //       });
      //     }, viewNamePKCache => {
      //       throw new Error(`Can't create view ${viewNamePKCache}`);
      //     }
      //   );
      // }

      // create view with cache in 'primarySort'
      // SHOULD BE UNCOMMENTED AFTER FIXING SEARCH-466
      // progress('createViewPSCache');
      // let viewNamePSCache = `viewPSCache_${loopCount}`;
      // let viewPSCache = createSafe(viewNamePSCache,
      //   viewNamePSCache => {
      //     return db._createView(viewNamePSCache, "arangosearch", { 
      //       "primarySort": [ 
      //         { "field": "animal", "direction": "desc" }, 
      //         { "field": "name", "direction": "asc" }
      //       ],  
      //       "primarySortCache": true 
      //     });
      //   }, viewNamePSCache => {
      //     throw new Error(`Can't create view ${viewNamePSCache}`);
      //   }
      // );

      // create view with without utilizing cache
      progress('createViewNoCache');
      let viewNameNoCache = `viewNoCache_${loopCount}`;
      let viewNoCache = createSafe(viewNameNoCache,
        viewNameNoCache => {
          return db._createView(viewNameNoCache, "arangosearch", { 
            "storedValues": [
              { "fields": ["animal", "name"], "cache": false }
            ],
            "primarySort": [ 
              { "field": "animal", "direction": "desc" }, 
              { "field": "name", "direction": "asc" }
            ],  
            "primarySortCache": false 
          });
        }, viewNameNoCache => {
          throw new Error(`Can't create view ${viewNameNoCache}`);
        }
      );

      let cacheSizeSupported = isCacheSizeSupported(currVersion);

      let cacheSize = 0;
      let prevCacheSize = cacheSize;

      if (cacheSizeSupported && isEnterprise) {
        cacheSize = getMetric("arangodb_search_columns_cache_size", options);
        if (cacheSize != 0) {
          throw new Error(`initial cache size is ${cacheSize} (not 0)`);
        }
      }

      arangosearchTestCases.forEach(test => {
        // create collection for each testing link
        let collectionName = `${test["collectionName"]}_as_${loopCount}`; // collections for testing 'arangosearch'
        createCollectionSafe(collectionName, 3, 1);
        // insert some test data. Also insert version, on which 'make_data' was called
        db._collection(collectionName).insert([
          { "animal": "cat", "name": "tom", "geo_location": { "type": "Point", "coordinates": [0.937, 50.932] }, "geo_latlng": { "lat": 50.932, "lng": 6.937 } },
          { "animal": "mouse", "name": "jerry", "location": { "type": "Point", "coordinates": [12.7, 3.93] }, "geo_latlng": { "lat": 50.941, "lng": 6.956 } },
          { "animal": "dog", "name": "harry", "location": { "type": "Point", "coordinates": [-6.27, 51.81] }, "geo_latlng": { "lat": 50.932, "lng": 6.962 } },
          { "version": currVersion }
        ]);

        // add links to each created collection one by one
        let meta = {
          links: {}
        };
        meta.links[collectionName] = test["link"];
        [[viewSVCache, true], /*[viewPSCache, true], [viewPKCache, true]*/, [viewNoCache, false]].forEach(viewTest => {
          let view = viewTest[0];
          if (view == undefined) {
            return;
          }
          view.properties(meta);

          if (cacheSizeSupported && isEnterprise) {
            let utilizeCache = test["link"]["utilizeCache"]; // is cache utilized by link?
            let viewUtilizeCache = viewTest[1]; // is cache utilized by view?
        
            // update cacheSize
            cacheSize = getMetric("arangodb_search_columns_cache_size", options);
            print(cacheSize);
            if (utilizeCache || viewUtilizeCache) {
              if (cacheSize <= prevCacheSize) {
                throw new Error(`Cache size should be increased. View: ${view.name()}. CollectionName: ${collectionName}. cacheSize: ${cacheSize}. prevCacheSize: ${prevCacheSize}`);
              }
            } else {
              if (cacheSize > prevCacheSize) {
                throw new Error(`Cache size should not be increased. View: ${view.name()}. CollectionName: ${collectionName}. cacheSize: ${cacheSize}. prevCacheSize: ${prevCacheSize}`);
              }
            }
            prevCacheSize = cacheSize;
          }
        });
      });

      // cache for inverted index is exists only since 3.10.2 
      if (semver.gte(currVersion, "3.10.2")) {
        invertedIndexTestCases.forEach(test => {
          // This collection was created on previous step. Just extract the name.
          let collectionName = `${test["collectionName"]}_ii_${loopCount}`; // collection for testing inverted index
          createCollectionSafe(collectionName, 3, 1);

          db._collection(collectionName).insert([
            { "animal": "cat1", "name": "tom2", "geo_location": { "type": "Point", "coordinates": [1.937, 40.932] }, "geo_latlng": { "lat": 40.932, "lng": 8 } },
            { "animal": "mouse1", "name": "jerry2", "location": { "type": "Point", "coordinates": [22.7, 4.93] }, "geo_latlng": { "lat": 51.941, "lng": 7 } },
            { "animal": "dog1", "name": "harry2", "location": { "type": "Point", "coordinates": [6.27, 55.81] }, "geo_latlng": { "lat": 50.9, "lng": 7 } },
            { "version": currVersion }
          ]);
  
          let status = db._collection(collectionName).ensureIndex(test);
          if (status["code"] != 201) {
            throw new Error(`Failed to create index for collection ${$test["collectionName"]}. Status: ${status}`);
          }

          if (cacheSizeSupported && isEnterprise) {
            let utilizeCache = test["utilizeCache"]; // is cache utilized by index?
        
            // update cacheSize
            cacheSize = getMetric("arangodb_search_columns_cache_size", options);
            print(cacheSize);
            if (utilizeCache) {
              if (cacheSize <= prevCacheSize) {
                throw new Error(`Cache size should be increased. collectionName: ${collectionName}. cacheSize: ${cacheSize}. prevCacheSize: ${prevCacheSize}`);
              }
            } else {
              if (cacheSize > prevCacheSize) {
                throw new Error(`Cache size should not be increased. collectionName: ${collectionName}. cacheSize: ${cacheSize}. prevCacheSize: ${prevCacheSize}`);
              }
            }
            prevCacheSize = cacheSize;
          }
        });
      }
    },
    checkData: function (options, isCluster, isEnterprise, dbCount, loopCount, readOnly) {
      print(`checking data ${dbCount} ${loopCount}`);

      let oldVersion = db._query(`for d in version_collection_${loopCount} filter HAS(d, 'version') return d.version`).toArray()[0];
      if (semver.lt(oldVersion, '3.9.5')) {
        // old version doesn't support column cache.
        // MakeData was not called. Nothing to check here.
        return;
      }

      let currVersion = db._version();
      let isCacheSupportedOld = isCacheSizeSupported(oldVersion);
      let isCacheSupported = isCacheSizeSupported(currVersion);

      if (isCacheSupported && isEnterprise) {
        cacheSize = getMetric("arangodb_search_columns_cache_size", options);
        if (cacheSize == 0) {
          throw new Error("cache size is equal to zero in checkData");
        }
      }

      let viewSVCache = db._view(`viewSVCache_${loopCount}`);
      // SHOULD BE UNCOMMENTED AFTER FIXING SEARCH-466
      // let viewPSCache = db._view(`viewPSCache_${loopCount}`);
      // let viewPKCache = db._view(`viewPKCache_${loopCount}`);
      let viewNoCache = db._view(`viewNoCache_${loopCount}`);

      // for 3.10.0 and 3.10.1 we should verify that no cache is present
      if (!isCacheSupported || (!isCacheSupportedOld && isCacheSupported) || !isEnterprise) {
        // we can't see 'cache fields' in current version OR
        // in previous version 'cache' was not supported.
        // So it means that in current version there should be NO 'cache' fields
        if (viewSVCache.properties()["storedValues"][0].hasOwnProperty("cache")) {
          throw new Error(`viewSVCache: cache value for storedValues is present! oldVersion:${oldVersion}, newVersion:${currVersion}`);
        }
        // SHOULD BE UNCOMMENTED AFTER FIXING SEARCH-466
        // if (viewPKCache.properties().hasOwnProperty("primaryKeyCache")) {
        //   throw new Error(`viewSVCache: cache value for storedValues is present! oldVersion:${oldVersion}, newVersion:${currVersion}`);
        // }
        // if (viewPSCache.properties().hasOwnProperty("primarySortCache")) {
        //   throw new Error(`viewPSCache: cache value for primarySort is present! oldVersion:${oldVersion}, newVersion:${currVersion}`);
        // }
      } else {
        // current and previous versions are aware of 'cache'. 
        // Check that value is present and equal to value from previous version
        if (viewSVCache.properties()["storedValues"][0]["cache"] != true) {
          throw new Error("cache value for storedValues is not 'true'!");
        }
        // SHOULD BE UNCOMMENTED AFTER FIXING SEARCH-466
        // if (viewPKCache.properties()["primaryKeyCache"] != true) {
        //   throw new Error("cache value for primaryKeyCache is not 'true'!");
        // }
        // if (viewPSCache.properties()["primarySortCache"] != true) {
        //   throw new Error("cache value for primarySort is not 'true'!");
        // }
      }

      if (viewNoCache.properties()["storedValues"][0].hasOwnProperty("cache")) {
        throw new Error(`viewNoCache: cache value for storedValues is present! oldVersion:${oldVersion}, newVersion:${currVersion}`);
      }
      if (viewNoCache.properties().hasOwnProperty("primaryKeyCache")) {
        throw new Error(`viewNoCache: cache value for primaryKeyCache is present! oldVersion:${oldVersion}, newVersion:${currVersion}`);
      }
      if (viewNoCache.properties().hasOwnProperty("primarySortCache")) {
        throw new Error(`viewNoCache: cache value for primarySort is present! oldVersion:${oldVersion}, newVersion:${currVersion}`);
      }

      [viewSVCache, /*viewPSCache, viewPKCache,*/ viewNoCache].forEach(view => {
        if (view == undefined) {
          return;
        }
        let actualLinks = view.properties().links;

        arangosearchTestCases.forEach(test => {
          // get link for each collection
          let collectionName = `${test["collectionName"]}_as_${loopCount}`;
          let linkFromView = actualLinks[collectionName];
          if (!isCacheSupported || (!isCacheSupportedOld && isCacheSupported) || !isEnterprise) {
            // we can't see 'cache fields' in current version OR
            // in previous version 'cache' was not supported.
            // So it means that in current version there should be NO 'cache' fields
            if (linkFromView.hasOwnProperty('cache')) {
              throw new Error(`cache value on root level in link should not present! view: ${view.name()}. 
              collection: ${collectionName}, oldVersion:${oldVersion}, newVersion:${currVersion}`);
            }
            if (linkFromView["fields"].hasOwnProperty("animal")) {
              if (linkFromView["fields"]["animal"].hasOwnProperty('cache')) {
                throw new Error(`cache value on field level in link should not present! view: ${view.name()}. 
                collection: ${collectionName}, oldVersion:${oldVersion}, newVersion:${currVersion}`);
              }
            }
            if (linkFromView["fields"].hasOwnProperty("geo_location")) {
              if (linkFromView["fields"]["geo_location"].hasOwnProperty('cache')) {
                throw new Error(`cache value on field level in link should not present! view: ${view.name()}. 
                collection: ${collectionName}, oldVersion:${oldVersion}, newVersion:${currVersion}`);
              }
            }
            if (linkFromView["fields"].hasOwnProperty("geo_latlng")) {
              if (linkFromView["fields"]["geo_latlng"].hasOwnProperty('cache')) {
                throw new Error(`cache value on field level in link should not present! view: ${view.name()}. 
                collection: ${collectionName}, oldVersion:${oldVersion}, newVersion:${currVersion}`);
              }
            }
          } else {
            // current and previous versions are aware of 'cache'. 
            // Check that value is present and equal to value from previous version
            let expectedLink = test["link"];
            if (!compare(isCacheSupported, "arangosearch", linkFromView, expectedLink)) {
              let msg = `View: ${view.name()}: Links for collection ${collectionName} are not equal! 
              Link from view: ${JSON.stringify(linkFromView)}, Expected link: ${JSON.stringify(expectedLink)}`;
              throw new Error(msg);
            }
          }
        });
      });

      if (semver.gt(oldVersion, "3.10.2")) {
        invertedIndexTestCases.forEach(test => {
          let collectionName = `${test["collectionName"]}_ii_${loopCount}`;
          let actualIndex = db._collection(collectionName).index(test["name"]);

          let expectedIndex = test;
          if (!isCacheSupported || (!isCacheSupportedOld && isCacheSupported) || !isEnterprise) {
            // we can't see 'cache fields' in current version OR
            // in previous version 'cache' was not supported.
            // So it means that in current version there should be NO 'cache' fields

          } else {
            if (!compare(isCacheSupported, "index", actualIndex, expectedIndex)) {
              let msg = `Indexes for collection ${collectionName} are not equal! 
              Index from collection: ${JSON.stringify(actualIndex)}, Expected index: ${JSON.stringify(expectedIndex)}`;
              throw new Error(msg);
            }
          }
        });
      }
    },

    clearData: function (options, isCluster, isEnterprise, dbCount, loopCount, readOnly) {
      print(`removing data ${dbCount} ${loopCount}`);
      try {
        db._dropView(`viewSVCache_${loopCount}`);
      } catch (e) {
        print(e);
        throw e;
      }
      // SHOULD BE UNCOMMENTED AFTER FIXING SEARCH-466
      // try {
      //   db._dropView(`viewPKCache_${loopCount}`);
      // } catch (e) {
      //   print(e);
      //   throw e;
      // }
      // try {
      //   db._dropView(`viewPSCache_${loopCount}`);
      // } catch (e) {
      //   print(e);
      //   throw e;
      // }
      try {
        db._dropView(`viewNoCache_${loopCount}`);
      } catch (e) {
        print(e);
        throw e;
      }
      try {
        arangosearchTestCases.forEach(test => {
          // get collection and drop it
          let collectionName = `${test["collectionName"]}_as_${loopCount}`;
          db._drop(collectionName);
        });
        invertedIndexTestCases.forEach(test => {
          // get collection and drop it
          let collectionName = `${test["collectionName"]}_ii_${loopCount}`;
          db._drop(collectionName);
        });
      } catch (e) {
        print(e);
        throw e;
      }
      deleteAnalyzer_400("", "geo_point");
      deleteAnalyzer_400("", "geo_json");
      arangosearchTestCases.forEach(test => {
        if (test.link.hasOwnProperty('analyzers')) {
          test.link.analyzers.forEach(analyzer => {
            deleteAnalyzer_400(test.collectionName, analyzer);
          });
        }
      });
    }
  };
}());
