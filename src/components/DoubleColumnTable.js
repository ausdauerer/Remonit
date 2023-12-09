import React, { useState } from "react";

function DoubleColumnTable(props) {
  const getBodyRows = (values) => {
    const rows = [];
    for (let i = 0; i < values.length; i += 2) {
      rows.push(
        <tr index={i}>
          <td class="p-1 text-sm font-sm text-center w-1/2">
            {values[i]}
          </td>
          <td class="p-1 text-sm font-sm text-center w-1/2">
            {values[i + 1]}
          </td>
        </tr>
      );
    }
    return rows;
  };

  return (
    <div class="border-black border-2 rounded-md m-1">
        <table class="w-full table-auto">
            <tr>
                <th class="p-2 bg-gray-200 rounded-t-md text-sm font-medium border-b-2 border-black text-center" colspan="2">{props.tableName}</th>
            </tr>
            <tr>
                <th class="p-2 bg-gray-100 rounded-tl-md text-sm font-medium border-b-2 border-black">Key</th>
                <th class="p-2 bg-gray-100 rounded-tr-md text-sm font-medium border-b-2 border-black text-center text-center">Value</th>
            </tr>
          {getBodyRows(props.values)}
        </table>
    </div>
  );
}

export default DoubleColumnTable;
