import React, { useState } from "react";
import * as xlsx from "xlsx";
import { Table, Container } from "reactstrap";
import { useTable } from "react-table";
import {
  CANCELLATIONS_CSR,
  CANCELLATIONS_SSR,
  CANCELLATIONS_UI,
  FC_TRACKING_CSR,
  FC_TRACKING_SSR,
  FC_TRACKING_UI,
  LOT_API,
  LOT_CSR,
  LOT_SSR,
  LOT_UI,
  TIPPING_N_FEEDBACK,
} from "./Constants";
import "./App.css";

const GroupNames = [
  {
    name: "Live Order Tracking",
    item: [LOT_API, LOT_CSR, LOT_SSR, LOT_UI],
    threshold: 3,
  },
  {
    name: "Track Shipment",
    item: [FC_TRACKING_CSR, FC_TRACKING_SSR, FC_TRACKING_UI],
    threshold: 1,
  },
  {
    name: "Cancellations",
    item: [CANCELLATIONS_CSR, CANCELLATIONS_SSR, CANCELLATIONS_UI],
    threshold: 1,
  },
  {
    name: "Tipping & Feedback",
    item: [TIPPING_N_FEEDBACK],
    threshold: 3,
  },
];

const MyCell = ({ column, row }) => {
  console.log(column);
  return row.values.groupedItem.map((item) => {
    return (
      <>
        <p>{item[column.Header]}</p>
        <hr className="solid" />
      </>
    );
  });
};

const ErrorRate = ({ column, row }) => {
  console.log(row);
  return (
    <span
      className={
        parseFloat(row.values.average) > parseFloat(row.values.threshold)
          ? "danager"
          : "success"
      }
    >
      {row.values.average}
    </span>
  );
};

function App() {
  const columns = React.useMemo(
    () => [
      {
        Header: "Feature",
        accessor: "groupName",
      },
      {
        Header: "EventName",
        Cell: MyCell,
      },

      {
        Header: "ErrorCount",
        Cell: MyCell,
      },
      {
        Header: "EventCount",
        Cell: MyCell,
      },
      {
        Header: "Error Rate in %",
        accessor: "groupedItem", // accessor is the "key" in the data
        Cell: MyCell,
      },
      {
        Header: "Error Rate in %(total)",
        accessor: "total",
      },
      {
        Header: "Threshold in %",
        accessor: "threshold",
      },
      {
        Header: "Error Rate in %(average)",
        accessor: "average",
        Cell: ErrorRate,
      },
    ],
    []
  );

  const groupedData = (data = []) => {
    const result = [];
    GroupNames.forEach((group) => {
      const groupedItem = group.item.map((item) => {
        return data.find((x) => x.EventName === item);
      });
      const total = groupedItem.reduce((previousValue, currentValue) => {
        return previousValue + currentValue["Error Rate in %"];
      }, 0);

      result.push({
        groupedItem,
        groupName: group.name,
        threshold: group.threshold,
        total: total.toFixed(2),
        average: (total / groupedItem.length).toFixed(2),
      });
    });

    return result;
  };
  const readUploadFile = (e) => {
    e.preventDefault();
    if (e.target.files) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target.result;
        const workbook = xlsx.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        setxlxsJSON(groupedData(xlsx.utils.sheet_to_json(worksheet)));
        // console.log(xlsx.utils.sheet_to_json(worksheet));
      };
      reader.readAsArrayBuffer(e.target.files[0]);
    }
  };

  const [data, setxlxsJSON] = useState([]);
  const { getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
    columns,
    data,
  });

  return (
    <Container>
      <div class="file-upload">
        <div class="image-upload-wrap">
          <input
            class="file-upload-input"
            id="oeSheetUpload"
            type="file"
            onChange={readUploadFile}
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          />
          <div class="drag-text">
            <h3>Select the CSV file</h3>
          </div>
        </div>
      </div>
      {data.length > 1 && (
        <Table>
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th
                    {...column.getHeaderProps()}
                    style={{
                      borderBottom: "solid 3px red",
                      background: "aliceblue",
                      color: "black",
                      fontWeight: "bold",
                    }}
                  >
                    {column.render("Header")}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map((row) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map((cell) => {
                    return (
                      <td
                        {...cell.getCellProps()}
                        style={{
                          padding: "10px",
                          border: "solid 1px gray",
                          background: "papayawhip",
                        }}
                      >
                        {cell.render("Cell")}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </Container>
  );
}

export default App;
