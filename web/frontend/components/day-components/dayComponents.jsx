import React, { useState } from "react";

import "react-datepicker/dist/react-datepicker.css";
import "../../css/dot-chasing.css";
import "../../css/tab-effect.css";
import "../../css/tab-sample.css";
import { useToast } from "../../hooks/useToast";
import { styles } from "../../styles";
import { Row } from "../row-components/rowComponents";

export const Day = ({
  dayData,
  dayIndex,
  setData,
  allData,
  isDate = true,
  isSave = true,
  index,
  handleAddRow,
  handleRemoveRow,
  handleSaveDay,
  isPlacedOrders = false,
  isLoading,
  saveDay,
  orderNotInScheduleOptions = [],
  setIsAssignedOrder,
  selectedDate,
}) => {
  const [isSavePress, setIsSavePressed] = useState(false);
  const { toastMarkup } = useToast({
    isLoading,
  });

  const dayInWeek = {
    "Sun": "Sunday",
    "Mon": "Monday",
    "Tue": "Tuesday",
    "Wed": "Wednesday",
    "Thu": "Thursday",
    "Fri": "Friday",
    "Sat": "Saturday",
  }

  const handleCheckValidate = () => {
    let nullItem = dayData.data.find(
      (item) =>
        item.area === "" || item.comment === "" || item.maximum_order === ""
    );
    return nullItem ? false : true;
  };

  const handleSaveDayValidate = () => {
    if (handleCheckValidate()) {
      handleSaveDay(day, dayData.date, dayData.data);
      setIsSavePressed(true);
      setTimeout(() => {
        setIsSavePressed(false);
      }, 4000);
    } else {
      setIsSavePressed(true);
      setTimeout(() => {
        setIsSavePressed(false);
      }, 4000);
    }
  };
  let day = dayIndex;

  return (
    <div key={day}>
      {toastMarkup}
      <div style={styles.textDateStyle}>
        {isDate && <div>{dayInWeek[dayData.date]}</div>}
      </div>
      {dayData.data.length != 0 && (
        <div
          style={{
            marginLeft: 4,
            display: "flex",
            flexDirection: "row",
            gap: "12px",
          }}
        >
          <b style={styles.commentContainer}>Comment</b>
          <b style={styles.selectContainer}>Area</b>
          <b style={styles.selectContainer}>District</b>
          <b style={styles.selectContainerShort}>Customer Type</b>

          <b style={styles.selectContainerShort}>Maximum Orders</b>
          {isPlacedOrders && (
            <b style={styles.selectContainerShort}>Placed Orders</b>
          )}
          {isPlacedOrders && (
            <b style={styles.selectContainerShort}>Assign Order</b>
          )}
          <b style={{ width: 30 }} />
          <b>Move</b>
        </div>
      )}
      {dayData.data.map((rowData, rowIndex) => {
        return (
          <Row
            isLoading={isLoading}
            rowData={rowData}
            rowIndex={rowIndex}
            dayIndex={dayIndex}
            key={rowIndex}
            setData={setData}
            allData={allData}
            isPlacedOrders={isPlacedOrders}
            handleDeleteRow={handleRemoveRow}
            day={dayData.date}
            saveDay={saveDay}
            dayData={dayData}
            isSavePress={isSavePress}
            orderNotInScheduleOptions={orderNotInScheduleOptions}
            setIsAssignedOrder={setIsAssignedOrder}
            selectedDate={selectedDate}
          />
        );
      })}

      <div>
        {dayData.data.length != 0 && (
          <div style={{ paddingTop: 12 }}>
            Enter a 'maximum orders' value of 0 to hide a slot from the
            customers.
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div
            style={styles.buttonAddRowContainer}
            onClick={() => {
              if (handleCheckValidate()) {
                !isLoading &&
                  handleAddRow(
                    dayIndex,
                    dayData.date,
                    allData,
                    isPlacedOrders,
                    dayData
                  );
              } else {
                null;
              }
            }}
          >
            <b>Add Row</b>
          </div>
          {
            <div
              style={styles.buttonSaveContainer}
              onClick={() => {
                handleSaveDayValidate();
              }}
            >
              <b>Save</b>
            </div>
          }
        </div>
      </div>
    </div>
  );
};
