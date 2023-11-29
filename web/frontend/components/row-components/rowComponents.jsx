import { TextField, Select, Icon } from "@shopify/polaris";
import React, { useEffect, useMemo, useState } from "react";
import { DeleteMajor } from "@shopify/polaris-icons";
import { styles } from "../../styles";
import {
  AREA_OPTIONS,
  CUSTOMER_TYPE_OPTIONS,
  DISTRICT_OPTIONS,
} from "../../constants/area";
import "../../css/dot-chasing.css";
import "../../css/tab-effect.css";
import "../../css/tab-sample.css";
import "react-datepicker/dist/react-datepicker.css";

export const Row = ({
  rowData,
  rowIndex,
  dayIndex,
  setData,
  allData,
  handleDeleteRow,
  isPlacedOrders,
  day,
  isLoading,
  saveDay,
  dayData,
  isSavePress,
}) => {
  const [comment, setComment] = useState("");
  const [area, setArea] = useState("");
  const [district, setDistrict] = useState("");
  const [customerType, setCustomerType] = useState("");
  const [maximumOrders, setMaximumOrders] = useState("");
  const [placedOrders, setPlacedOrders] = useState([]);
  const [districtOptions, setDistrictOptions] = useState([]);
  const storeName = "vmo-staging";

  const gotoOrder = (id) => {
    if (id) {
      let orderId = id.split("gid://shopify/Order/").at(1);
      let url = `https://admin.shopify.com/store/${storeName}/orders/`;
      window.open(url + orderId, "_blank");
    } else {
      console.log("id is not defined");
    }
  };

  useEffect(() => {
    rowData &&
      (setComment(rowData.comment),
      setArea(rowData.area),
      setDistrict(rowData.district),
      setCustomerType(rowData.customer_type),
      setMaximumOrders(rowData.maximum_order),
      rowData?.schedule_orders && setPlacedOrders(rowData?.schedule_orders));
    let districtCustomOption = DISTRICT_OPTIONS.find(
      (item) => item.area === rowData.area
    );
    setDistrictOptions(districtCustomOption?.district);
  }, [rowData]);

  const isCompare = useMemo(
    () =>
      rowData?.maximum_order ===
        (rowData?.schedule_orders && rowData?.schedule_orders.length) || false,
    [rowData]
  );

  const getDistrictOption = (area) => {
    let districtCustomOption = DISTRICT_OPTIONS.find(
      (item) => item.area === area
    );
    setDistrictOptions([...districtCustomOption.district]);
  };

  const handleMoveUp = ({ dayIndex, rowIndex, allData }) => {
    let tempNewData = [...allData[dayIndex].data];
    let tempItemFrom = allData[dayIndex].data[rowIndex];
    if (rowIndex >= 1) {
      tempNewData.splice(rowIndex, 1, allData[dayIndex].data[rowIndex - 1]);
      tempNewData.splice(rowIndex - 1, 1, tempItemFrom);
    }
    let itemDate = {
      data: tempNewData,
      date: allData[dayIndex].date,
    };
    let newAlldata = [...allData];
    newAlldata.splice(dayIndex, 1, itemDate);
    setData(newAlldata);
  };

  const handleMoveDown = ({ dayIndex, rowIndex, allData }) => {
    let tempNewData = [...allData[dayIndex].data];
    let tempItemFrom = allData[dayIndex].data[rowIndex];
    if (rowIndex < allData[dayIndex].data.length - 1) {
      tempNewData.splice(rowIndex, 1, allData[dayIndex].data[rowIndex + 1]);
      tempNewData.splice(rowIndex + 1, 1, tempItemFrom);
    }
    let itemDate = {
      data: tempNewData,
      date: allData[dayIndex].date,
    };
    let newAlldata = [...allData];
    newAlldata.splice(dayIndex, 1, itemDate);
    setData(newAlldata);
  };

  const handleChangeComment = (value) => {
    setComment(value);
    saveDay(
      {
        dayIndex,
        id_schedule_default: rowData.id_schedule_default || null,
        schedule_date: rowData.schedule_date,
        comment: value,
        customer_type: rowData.customer_type,
        maximum_order: rowData.maximum_order,
        is_customed: rowData.is_customed,
        area,
        district,
        priority: rowData.priority,
      },
      allData,
      dayIndex,
      rowIndex
    );
  };

  const handleChangeDistrict = (value) => {
    setDistrict(value);
    saveDay(
      {
        dayIndex,
        id_schedule_default: rowData.id_schedule_default,
        schedule_date: rowData.schedule_date,
        comment,
        customer_type: rowData.customer_type,
        maximum_order: rowData.maximum_order,
        is_customed: rowData.is_customed,
        area,
        district: value,
        priority: rowData.priority,
      },
      allData,
      dayIndex,
      rowIndex
    );
  };

  const handleChangeCustomerType = (value) => {
    setCustomerType(value);
    saveDay(
      {
        dayIndex,
        id_schedule_default: rowData.id_schedule_default,
        schedule_date: rowData.schedule_date,
        comment,
        customer_type: value,
        maximum_order: rowData.maximum_order,
        is_customed: rowData.is_customed,
        area,
        district,
        priority: rowData.priority,
      },
      allData,
      dayIndex,
      rowIndex
    );
  };

  return (
    <div key={rowData?.id_schedule_default} style={styles.rowContainer}>
      <div style={styles.commentContainer}>
        <TextField
          error={
            isSavePress ? (comment ? false : "This field is required") : false
          }
          disabled={isPlacedOrders && placedOrders.length != 0 ? true : false}
          label="Comment"
          placeholder="Enter Comment"
          value={comment}
          maxLength="25"
          onChange={handleChangeComment}
          autoComplete="off"
          labelHidden
        />
      </div>
      <div style={styles.selectContainer}>
        <Select
          error={
            isSavePress ? (area ? false : "This field is required") : false
          }
          disabled={isPlacedOrders && placedOrders.length != 0 ? true : false}
          label="Area"
          placeholder="Select Area"
          options={AREA_OPTIONS}
          onChange={(value) => {
            getDistrictOption(value);
            setArea(value),
              saveDay(
                {
                  dayIndex,
                  id_schedule_default: rowData.id_schedule_default,
                  schedule_date: rowData.schedule_date,
                  comment,
                  customer_type: rowData.customer_type,
                  maximum_order: rowData.maximum_order,
                  is_customed: rowData.is_customed,
                  area: value,
                  district,
                  priority: rowData.priority,
                },
                allData,
                dayIndex,
                rowIndex
              );
          }}
          value={area}
          labelHidden
        />
      </div>
      <div style={styles.selectContainer}>
        <Select
          disabled={isPlacedOrders && placedOrders.length != 0 ? true : false}
          label="District"
          // placeholder="Select District"
          options={districtOptions}
          onChange={handleChangeDistrict}
          value={district}
          labelHidden
        />
      </div>
      <div style={styles.selectContainerShort}>
        <Select
          disabled={isPlacedOrders && placedOrders.length != 0 ? true : false}
          label="Customer Type"
          placeholder="Select Customer Type"
          options={CUSTOMER_TYPE_OPTIONS}
          onChange={handleChangeCustomerType}
          value={customerType}
          labelHidden
        />
      </div>
      <div style={styles.selectContainerShort}>
        <TextField
          error={
            isSavePress
              ? maximumOrders || maximumOrders !== ""
                ? false
                : "This field is required"
              : false
          }
          min={0}
          max={999}
          type="number"
          label="Maximum Orders"
          value={maximumOrders}
          onChange={(value) => {
            let formatValue = value
              .replace(/[^0-9]/g, "")
              .replace(/(\...*?)\..*/g, "$1")
              .replace(/^0[^.]/, "0");
            formatValue < 0 ||
            formatValue > 999 ||
            (value < rowData.schedule_orders?.length && value != "")
              ? null
              : (setMaximumOrders(Number(formatValue)),
                saveDay(
                  {
                    dayIndex,
                    id_schedule_default: rowData.id_schedule_default,
                    schedule_date: rowData.schedule_date,
                    comment,
                    customer_type: rowData.customer_type,
                    maximum_order: formatValue,
                    is_customed: rowData.is_customed,
                    area,
                    district,
                    priority: rowData.priority,
                  },
                  allData,
                  dayIndex,
                  rowIndex
                ));
          }}
          autoComplete="off"
          labelHidden
        />
      </div>
      {isPlacedOrders && (
        <div
          style={
            isCompare
              ? styles.selectContainerPlaceOrderWarning
              : styles.selectContainerPlaceOrder
          }
        >
          <b style={styles.textPlaceOrder}>{placedOrders.length}</b>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              backgroundColor: "white",
            }}
          >
            {placedOrders.length > 0 &&
              placedOrders.map((item, index) => {
                return (
                  <b style={styles.orderContainerDetail} key={index}>
                    <u
                      onClick={() => {
                        gotoOrder(item.order_id);
                      }}
                    >
                      {item.order_name}{" "}
                    </u>
                  </b>
                );
              })}
          </div>
        </div>
      )}
      <div style={styles.iconDeleteContainer}>
        <div
          onClick={() => {
            if (isPlacedOrders) {
              (!rowData?.schedule_orders ||
                rowData?.schedule_orders?.length === 0) &&
                !isLoading &&
                handleDeleteRow(
                  rowIndex,
                  dayIndex,
                  rowData.id_schedule,
                  allData
                );
            } else
              !isLoading &&
                handleDeleteRow(
                  rowIndex,
                  dayIndex,
                  rowData.id_schedule_default,
                  allData
                );
          }}
        >
          <Icon
            source={DeleteMajor}
            color={
              isPlacedOrders
                ? !rowData?.schedule_orders ||
                  rowData?.schedule_orders?.length === 0
                  ? "black"
                  : "base"
                : "black"
            }
          />
        </div>
      </div>
      <div>
        <div style={styles.buttonMoveContainer}>
          <div
            style={styles.buttonMoveRowContainer}
            onClick={() =>
              handleMoveUp({ dayIndex, rowIndex, rowData, allData })
            }
          >
            <b>Up</b>
          </div>
          <div
            style={styles.buttonMoveRowContainer}
            onClick={() =>
              handleMoveDown({ dayIndex, rowIndex, rowData, allData })
            }
          >
            <b>Down</b>
          </div>
        </div>
      </div>
    </div>
  );
};
