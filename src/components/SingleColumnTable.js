import React, { useState } from "react";

function SingleColumnTable(props) {
  return (
    <div class="border-black border-2 rounded-md m-1">
      <table class="w-full table-auto">
        <tr>
          <th class="p-2 bg-gray-200 rounded-t-md text-sm font-medium border-b-2 border-black">
            {props.columnName}
          </th>
        </tr>
        {props.values? props.values.map((value, index) => (
          <tr key={index}>
            <td class="p-1 text-sm font-sm text-center">{value}</td>
          </tr>
        )) : ""}
      </table>
    </div>
  );
}

export default SingleColumnTable;
