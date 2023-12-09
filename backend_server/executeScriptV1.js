const lodash = require("lodash");
const Redis = require("ioredis");

const executeScript = (function () {
  getCommandDisplayStyle = (command) => {
    const commandPrefix = command.split(" ")[0];
    switch (commandPrefix) {
      case "ZRANGE":
        if (command.includes("WITHSCORES")) return "doubleRowMultiple";
        else return "singleRowMultiple";
      case "LRANGE":
        return "singleRowMultiple";
      default:
        return "single";
    }
  };

  getResultPromise = (
    redisCluster,
    commandString,
    argumentList,
    globalArguments,
    starArgument
  ) => {
    const argumentValues = lodash.clone(argumentList || []);
    let commandStringWithArgs = commandString.replace(/\?/g, function () {
      if (argumentValues.length > 0) {
        const a = argumentValues.shift();
        if (typeof a === "string" && a.includes("ARGV")) {
          return a.replace(/ARGV\[(.*?)\]/g, (match, captureGroup) => {
            return globalArguments[parseInt(captureGroup)];
          });
        } else {
          return a;
        }
      } else return "?";
    });
    commandStringWithArgs = commandStringWithArgs.replace(/\*/g, () => starArgument);
    //console.log(commandStringWithArgs);
    const [redisCommand, ...redisArgs] = commandStringWithArgs.split(" ");
    return {
      processedCommand: commandStringWithArgs,
      promise: redisCluster.sendCommand(
        new Redis.Command(redisCommand, redisArgs)
      ),
    };
  };

  return {
    execute: async function (script, redisCluster, args) {
      let start = Date.now();
      try {
        const commandPromises = [];
        const commandTags = [];
        const commandGroups = [];

        const groupNames = Object.keys(script);
        groupNames.forEach((groupName) => {
          const group = script[groupName];
          const tags = Object.keys(group);
          tags.forEach((tag) => {
            const functionResponse = getResultPromise(
              redisCluster,
              group[tag].command,
              group[tag].arguments,
              args,
              null
            );
            commandPromises.push(functionResponse["promise"]);
            commandTags.push(tag);
            commandGroups.push(groupName);
            group[tag].result = {
              displayStyle: getCommandDisplayStyle(
                functionResponse["processedCommand"]
              ),
            };
          });
        });

        const results = await Promise.all(commandPromises);

        const commandPromises2 = [];
        const commandTags2 = [];
        const commandGroups2 = [];
        const commandInput2 = [];

        results.forEach((result, index) => {
          if (Array.isArray(result)) {
            result = result.map((ele) => {
              const buffer = Buffer.from(ele);
              return buffer.toString("utf-8");
            });
          } else {
            result = result && result.toString("utf-8");
          }

          if (
            script[commandGroups[index]][commandTags[index]].hasOwnProperty(
              "runCommandOnResults"
            )
          ) {
            if(!Array.isArray(result)) result = [result];
            
            result.forEach((item) => {
                const functionResponse = getResultPromise(
                    redisCluster,
                    script[commandGroups[index]][commandTags[index]]
                      .runCommandOnResults.command,
                    script[commandGroups[index]][commandTags[index]]
                      .runCommandOnResults.arguments,
                    args,
                    item
                  );
                  commandPromises2.push(functionResponse["promise"]);
                  commandTags2.push(commandTags[index]);
                  commandGroups2.push(commandGroups[index]);
                  commandInput2.push(item);
            });
          } else {
            script[commandGroups[index]][commandTags[index]].result.values =
              result;
          }
        });

        //console.log(JSON.stringify(script));

        //console.log(JSON.stringify(commandTags2));
        const results2 = await Promise.all(commandPromises2);

        results2.forEach((result, index) => {
          if (Array.isArray(result)) {
            result = result.map((ele) => {
              const buffer = Buffer.from(ele);
              return buffer.toString("utf-8");
            });
          } else {
            result = result && result.toString("utf-8");
          }

          script[commandGroups2[index]][
            commandTags2[index]
          ].result.displayStyle = "doubleRowMultiple";
          if (
            script[commandGroups2[index]][commandTags2[index]].result.values
          ) {
            script[commandGroups2[index]][
              commandTags2[index]
            ].result.values.push(commandInput2[index]);
            script[commandGroups2[index]][
              commandTags2[index]
            ].result.values.push(result);
          } else {
            script[commandGroups2[index]][commandTags2[index]].result.values = [
              commandInput2[index],
              result,
            ];
          }
        });

        console.log(JSON.stringify(script));
        let timeTaken = Date.now() - start;
        console.log("Total time taken : " + timeTaken + " milliseconds");
        return script;
      } catch (e) {
        redisCluster.quit();
        console.log(e);
      }
    },
  };
})();

module.exports = executeScript;
