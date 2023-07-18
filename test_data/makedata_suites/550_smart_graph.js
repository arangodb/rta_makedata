/* global fs, PWD, writeGraphData, getShardCount, getReplicationFactor,  print, progress, db, createSafe, _, semver */

(function () {
  let gsm;
  let vertices = JSON.parse(fs.readFileSync(`${PWD}/makedata_suites/500_550_570_vertices.json`));
  let smartEdges = JSON.parse(fs.readFileSync(`${PWD}/makedata_suites/550_570_edges.json`));

  return {
    isSupported: function (currentVersion, oldVersion, options, enterprise, cluster) {
      if (enterprise) {
        gsm = require('@arangodb/smart-graph');
      }
      // strip off -nightly etc:
      let ver = semver.parse(oldVersion.split('-')[0]);
      // as of 3.10 BTS-776 has to have this workaround:
      return enterprise && (cluster || semver.lt(ver, "3.10.0"));
    },
    makeDataDB: function (options, isCluster, isEnterprise, database, dbCount) {
      // All items created must contain dbCount and dbCount
      print(`550: making data ${dbCount} ${dbCount}`);
      // And now a smart graph (if enterprise):
      createSafe(`G_smart_${dbCount}`, graphName => {
        return gsm._create(graphName,
                           [
                             gsm._relation(`citations_smart_${dbCount}`,
                                           [`patents_smart_${dbCount}`],
                                           [`patents_smart_${dbCount}`])],
                           [],
                           {
                             numberOfShards: getShardCount(3),
                             replicationFactor: getReplicationFactor(2),
                             smartGraphAttribute: "COUNTRY"
                           });
      }, graphName => {
        return gsm._graph(graphName);
      });
      progress('550: createEGraph2');
      writeGraphData(db._collection(`patents_smart_${dbCount}`),
                     db._collection(`citations_smart_${dbCount}`),
                     _.clone(vertices),
                     _.clone(smartEdges));
      progress('550: writeEGraph2 done');
    },
    checkDataDB: function (options, isCluster, isEnterprise, database, dbCount, readOnly) {
      print(`550: checking data ${dbCount} ${dbCount}`);
      const vColName = `patents_smart_${dbCount}`;
      let patentsSmart = db._collection(vColName);
      progress(`550: checking ${vColName} collection count`);
      if (patentsSmart.count() !== 761) {
        throw new Error(vColName + " expected count to be 761 but is: " + patentsSmart.count());
      }
      const eColName = `citations_smart_${dbCount}`;
      progress(`550: checking ${eColName} collection count`);
      let citationsSmart = db._collection(eColName);
      if (citationsSmart.count() !== 1000) {
        throw new Error(eColName + "count expected to be 1000 but is: " + citationsSmart.count());
      }
      const gName = `G_smart_${dbCount}`;
      progress(`550: checking query on ${gName}`);
      let len = db._query(`FOR v, e, p IN 1..10 OUTBOUND "${patentsSmart.name()}/US:3858245${dbCount}"
                   GRAPH "${gName}"
                   RETURN v`).toArray().length;
      if (len !== 6) {
        throw new Error("Black Currant 6 != " + len);
      }
      progress("550: ");
      len = db._query(`FOR p IN ANY K_SHORTEST_PATHS "${patentsSmart.name()}/US:60095410" TO "${patentsSmart.name()}/US:49997870"
                 GRAPH "${gName}"
                 LIMIT 100
                 RETURN p`).toArray().length;
      if (len !== 2) {
        throw new Error("White Currant 2 != " + len);
      }
      progress('550: done');
    },
    clearDataDB: function (options, isCluster, isEnterprise, database, dbCount) {
      print(`550: checking data ${dbCount} ${dbCount}`);
    // Drop graph:
      let gsm = require("@arangodb/smart-graph");
      progress('550 dropping smart graph');
      try {
        gsm._drop(`G_smart_${dbCount}`, true);
      } catch (e) { }
    }
  };
}());
