import React, { useState } from "react";

function SingleValue(props) {
  return (
    <div class="border-black border-2 rounded-md m-1">
      <table>
        <tr>
          <td class="p-2 bg-gray-200 rounded-l-md text-sm font-medium border-r-2 border-black">{props.keyName}</td>
          <td class="p-2 text-sm font-sm text-center" > {props.value}</td>
        </tr>
      </table>
    </div>
  );
}

export default SingleValue;
