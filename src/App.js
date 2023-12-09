import SingleColumnTable from "./components/SingleColumnTable";
import DoubleColumnTable from "./components/DoubleColumnTable";
import SingleValue from "./components/SingleValue";
import axios from "axios";
import { useState, useEffect } from "react";

function App() {
  const [script, setScript] = useState();
  const [uiComponents, setUIComponents] = useState();

  useEffect(() => {
    const updateUI = async () => {
      if(script) {
        const scriptCopy = JSON.parse(JSON.stringify(script));
        delete scriptCopy.updateInterval;

        axios
        .post("/executeScriptV1", scriptCopy)
        .then((response) => {
          setUIComponents(buildUIComponents(response.data));
        })
        .catch((error) => {
          console.log(error);
        });
      }
    };
    const intervalId = setInterval(updateUI, script && script.updateInterval || 5000);
    return () => clearInterval(intervalId);
  }, [script]);

  const buildUIComponents = (script) => {
    const r = Object.keys(script).map((groupName, index1) => (
      <div
        class="p-2 m-2 border-2 rounded-md border-gray-600 flex flex-col"
        key={index1}
      >
        <h3 class="font-semibold text-lg mb-2">{groupName}</h3>
        <div class="flex flex-col">
          {Object.keys(script[groupName]).map((tagName, index2) =>
            script[groupName][tagName].result.displayStyle ==
            "singleRowMultiple" ? (
              <SingleColumnTable
                key={index2}
                columnName={tagName}
                values={script[groupName][tagName].result.values}
              />
            ) : script[groupName][tagName].result.displayStyle ==
              "doubleRowMultiple" ? (
              <DoubleColumnTable
                key={index2}
                tableName={tagName}
                values={script[groupName][tagName].result.values}
              />
            ) : (
              <SingleValue
                key={index2}
                keyName={tagName}
                value={script[groupName][tagName].result.values}
              />
            )
          )}
        </div>
      </div>
    ));
    console.log(r);
    return r;
  };

  function toggleOverlay() {
    const overlay = document.getElementById("overlay");
    overlay.classList.toggle("hidden");
  }

  function saveScript() {
    const scriptText = document.getElementById("scriptTextArea").value;
    setScript(JSON.parse(scriptText));
    console.log(scriptText);
    const overlay = document.getElementById("overlay");
    overlay.classList.toggle("hidden");
  }

  return (
    <div class="flex flex-column flex-wrap">
      <div
        id="overlay"
        class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center hidden"
      >
        <div class="bg-white p-8 w-[90%] h-[75%] rounded-md shadow-md border-2 border-black flex flex-col">
          <h1 class="text-2xl font-semibold">Add script here</h1>
          <textarea id="scriptTextArea" class="bg-gray-200 w-full h-full mt-2 mb-2 border-2 border-black rounded-md" defaultValue={JSON.stringify(script, null, 2)} />
          <div class="flex-row flex justify-right">
            <button
              class="text-md font-semibold bg-gray-400 p-2 rounded-md transform transition-transform hover:scale-110 focus:outline-none active:scale-90 w-fit"
              onClick={toggleOverlay}
            >
              Close
            </button>
            <button
              class="text-md font-semibold bg-gray-400 p-2 rounded-md transform transition-transform hover:scale-110 focus:outline-none active:scale-90 w-fit ml-2"
              onClick={saveScript}
            >
              Save
            </button>
          </div>
        </div>
      </div>
      <div class="flex flex-row flex-wrap w-full m-2 p-3 bg-gray-200 border-2 border-black rounded-md justify-between items-center">
        <h1 class="text-2xl font-semibold transform transition-transform hover:scale-105 focus:outline-none ">
          Redis Monitoring
        </h1>
        <button
          class="text-md font-semibold bg-gray-400 p-2 rounded-md transform transition-transform hover:scale-110 focus:outline-none active:scale-90"
          onClick={toggleOverlay}
        >
          Add Or Modify Script
        </button>
      </div>
      <div class="flex flex-row flex-wrap flex-auto">{uiComponents}</div>
    </div>
  );
}

export default App;
