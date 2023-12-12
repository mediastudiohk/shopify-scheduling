import { Layout, Icon, Tabs, Card } from "@shopify/polaris";
import { TitleBar, useAuthenticatedFetch } from "@shopify/app-bridge-react";
import React, { useEffect, useState, useCallback, forwardRef } from "react";
import { CalendarMajor } from "@shopify/polaris-icons";
import DatePicker from "react-datepicker";
import { styles } from "../styles";
import { add, format } from "date-fns";
import { DAY_OF_WEEKS } from "../constants/dayOfWeek";
import "../css/dot-chasing.css";
import "../css/tab-effect.css";
import "../css/tab-sample.css";
import "react-datepicker/dist/react-datepicker.css";
import { Day } from "./day-components/dayComponents";
import CutOffComponents from "./cut-off-components/cutOffComponents";

import { comparePriority } from "../utils/comparePriority";
import { LoadingDot } from "./loading-dot";
import { DOMAIN, TAB_ENUMS } from "../constants/constants";
import { handleDayInWeek, handleDayInWeekV2 } from "../utils/date-utils";
import { useToast } from "../hooks/useToast";
import { gotoOrder } from "../utils";

function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleResize = () => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      };
      window.addEventListener("resize", handleResize);
      handleResize();
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);
  return windowSize;
}

export const DeliveryDefault = () => {
  const size = useWindowSize();
  const [selected, setSelected] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSelectDate, setIsLoadingSelectDate] = useState(false);
  const [defaultScheduleData, setDefaultScheduleData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [selectedDateData, setSelectedDateData] = useState([]);
  const [idDelete, setIdDelete] = useState([]);
  const [futureCustom, setFutureCustom] = useState([]);
  const [orderNotInSchedule, setOrderNotInSchedule] = useState([]);
  const [lastItemSelectedDate, setLastItemSelectedDate] = useState([]);
  const fetch = useAuthenticatedFetch();

  const [isAssignedOrder, setIsAssignedOrder] = useState(false);
  const { toastMarkup, setToastProps } = useToast({
    isLoading,
  });

  const handleTabChange = useCallback(
    (selectedTabIndex) => setSelected(selectedTabIndex),
    []
  );

  const ExampleCustomInput = forwardRef(({ value, onClick }, ref) => (
    <div style={styles.buttonCalendar} onClick={onClick}>
      <div>{value}</div>
      <div style={styles.iconCalendarContainer}>
        <div style={styles.iconCalendar}>
          <Icon source={CalendarMajor} color={"black"} />
        </div>
      </div>
    </div>
  ));

  const handleGetFutureDataDate = async () => {
    try {
      const response = await fetch(
        `${DOMAIN}/api/schedule/custom-date?fromDate=${format(
          new Date(),
          "yyyy-MM-dd"
        )}`
      );
      const data = await response.json();
      setFutureCustom(data.response);
    } catch (e) {
      console.log("Error:", e);
    }
  };

  const handleAddRow = (dayIndex, date, allData, isPlacedOrders, item) => {
    const newRow = {
      schedule_date: date,
      comment: "",
      customer_type: "Retail",
      maximum_order: 0,
      isCustomed: true,
      area: "",
      district: "",
    };
    let newAllData = [...allData];
    newAllData[dayIndex].data.push(newRow);
    setDefaultScheduleData(newAllData);
  };

  const handleRemoveRow = (rowIndex, dayIndex, id, allData) => {
    let newAllData = [...allData];
    newAllData[dayIndex].data.splice(rowIndex, 1);
    setDefaultScheduleData(newAllData);
    if (id) setIdDelete([...idDelete, id]);
  };

  const handleAddRowSpecialDate = (
    dayIndex,
    date,
    allData,
    isPlacedOrders,
    item
  ) => {
    let a = [];
    const newRow = {
      schedule_date: selectedDate,
      comment: "",
      customer_type: "Retail",
      maximum_order: 0,
      is_customed: true,
      area: "",
      district: "",
      priority: "",
      schedule_orders: a,
    };
    let newAllData = [...selectedDateData];
    newAllData[dayIndex].data.push(newRow);
    setSelectedDateData(newAllData);
  };

  const handleRemoveRowSpecialDate = async (
    rowIndex,
    dayIndex,
    id,
    allData
  ) => {
    let newAllData = [...selectedDateData];
    setLastItemSelectedDate([]);
    const handleDeleteRow = () => {
      newAllData[dayIndex].data.splice(rowIndex, 1);
      setSelectedDateData(newAllData);
    };
    if (allData[0].data?.length > 1) {
      if (id) {
        setIdDelete([...idDelete, id]);
      }
      handleDeleteRow();
    } else {
      let newLastItem = [...allData[0].data];
      setLastItemSelectedDate(newLastItem);
      handleDeleteRow();
    }
  };

  const saveDay = (item, allData, day, row) => {
    let newRowItem = allData[day].data[row];
    newRowItem["comment"] = item.comment;
    newRowItem["area"] = item.area;
    newRowItem["district"] = item.district;
    newRowItem["customer_type"] = item.customer_type;
    newRowItem["maximum_order"] = Number(item.maximum_order);
    let newDayItem = [...allData[day].data];
    newDayItem.splice(row, 1, newRowItem);
    let newAllData = [...allData];
    setDefaultScheduleData(newAllData);
  };

  const saveDaySelectedDate = (item, allData, day, row) => {
    let newRowItem = allData[day].data[row];
    newRowItem["comment"] = item.comment;
    newRowItem["area"] = item.area;
    newRowItem["district"] = item.district;
    newRowItem["customer_type"] = item.customer_type;
    newRowItem["maximum_order"] = Number(item.maximum_order);
    let newDayItem = [...allData[day].data];
    newDayItem.splice(row, 1, newRowItem);
    let newAllData = [...allData];
    setSelectedDateData(newAllData);
  };

  const handleSaveDay = (day, date, data) => {
    setIsLoading(true);
    let x = 0;
    let newData = data.map((item, index) => {
      return {
        ...item,
        priority: index,
        day_in_week: date,
        id_schedule_default: item.id_schedule_default || null,
      };
    });
    saveAll(newData);
    if (idDelete.length > 0 && idDelete && idDelete != [undefined]) {
      handleDeleteRow();
    }
  };

  const handleLastItemSelectedDate = (item) => {
    let newItem = [
      {
        ...item[0],
        maximum_order: 0,
        schedule_date: selectedDate,
        isCustomed: true,
      },
    ];
    saveAllSelectedDate(newItem);
  };

  const handleSaveDaySelectedDate = (day, date, data) => {
    let newData = data?.map((item, index) => {
      return { ...item, priority: index + 1, schedule_date: selectedDate };
    });

    if (newData.length && newData.length !== 0) {
      saveAllSelectedDate(newData);
    }

    if (idDelete.length > 0 && idDelete && idDelete != [undefined]) {
      handleDeleteRowSelectedDate();
    }
    if (lastItemSelectedDate.length != 0) {
      handleLastItemSelectedDate(lastItemSelectedDate);
    }
  };

  const handleCheckValidateMaximumOrders = (items) => {
    let nullItem = items.find(
      (item) => Number(item.maximum_order) < item.schedule_orders.length
    );

    return nullItem ? false : true;
  };

  const saveAllSelectedDate = async (items) => {
    setLastItemSelectedDate([]);
    try {
      let response = await fetch(`${DOMAIN}/api/schedule/bulk`, {
        method: "POST",
        body: JSON.stringify(items),
        headers: {
          "content-type": "application/json",
        },
      });
      let data = await response.json();
      if (response.status === 200) {
        setToastProps({ content: "Update Schedules Successfully!" });
        fetchDataDefaultToday(selectedDate);
        handleGetOrderWithOutSchedule();
        handleGetFutureDataDate();
      } else {
        if (!handleCheckValidateMaximumOrders(items)) {
          setToastProps({
            content: "Maximum orders cannot smaller than the Placed orders!",
            error: true,
          });
        } else
          setToastProps({
            content: "Some required fields are not filled!",
            error: true,
          });
      }
    } catch (error) {
      console.log("ERROR", error);
      setToastProps({
        content: error,
        error: true,
      });
    }
  };

  const saveAll = async (items) => {
    try {
      let response = await fetch(`${DOMAIN}/api/schedule-default/bulk`, {
        method: "POST",
        body: JSON.stringify(items),
        headers: {
          "content-type": "application/json",
        },
      });
      if (response.status === 200) {
        setToastProps({ content: "Update Schedules Successfully!" });
        fetchData();
      } else {
        setToastProps({
          content: "Some required fields are not filled!",
        });
        fetchData();
      }
    } catch (error) {
      console.log("Error:", error);
    }
  };

  const handleGetOrderWithOutSchedule = async () => {
    try {
      const response = await fetch(
        `${DOMAIN}/api/schedule-order/order-without-schedule`
      );
      const data = await response.json();
      setOrderNotInSchedule(data.response);
      setIsAssignedOrder(false);
    } catch (error) {
      console.log("Error:", error);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    let week = DAY_OF_WEEKS;
    try {
      const response = await fetch(`${DOMAIN}/api/schedule-default/`);
      const data = await response.json();
      if (
        data.response &&
        Object.keys(data.response).length === 0 &&
        Object.getPrototypeOf(data.response) === Object.prototype
      ) {
        let weekSchedule = week.map((item) => {
          return { date: item, data: [] };
        });
        setDefaultScheduleData(weekSchedule);
        setIsLoading(false);
      } else {
        let weekSchedule = week.map((item) => {
          return { date: item, data: [] };
        });

        let templateSchedule = Object.entries(data.response).map((item) => {
          if (item) {
            return { date: item[0], data: item[1].sort(comparePriority) };
          }
        });

        let currentTemplate = [];
        for (let i = 0; i < weekSchedule.length; i++) {
          let sameDate = templateSchedule.find(
            (item) => item.date === weekSchedule[i].date
          );
          if (sameDate) {
            currentTemplate.push({
              date: weekSchedule[i].date,
              data: [...weekSchedule[i].data, ...sameDate.data].sort(
                comparePriority
              ),
            });
          } else {
            currentTemplate.push(weekSchedule[i]);
          }
        }
        setIsLoading(false);
        if (currentTemplate.length != 0) {
          handleGetData(currentTemplate);
          setIsLoading(false);
          setToastProps({ content: "Get Orders Successfully!" });
        }
      }
    } catch (error) {
      setToastProps({
        content: error,
        error: true,
      });
      setIsLoading(false);
      console.log("ERROR:", error);
    }
  };

  const fetchDataDefaultToday = async (newDate) => {
    setIsLoadingSelectDate(true);
    let defaultSchedule = [];
    let week = DAY_OF_WEEKS;
    try {
      const response = await fetch(`${DOMAIN}/api/schedule-default/`);
      const data = await response.json();
      if (
        data.response &&
        Object.keys(data.response).length === 0 &&
        Object.getPrototypeOf(data.response) === Object.prototype
      ) {
        let weekSchedule = week.map((item) => {
          return { date: item, data: [] };
        });
        defaultSchedule = weekSchedule;
      } else {
        let weekSchedule = week.map((item) => {
          return { date: item, data: [] };
        });

        let templateSchedule = Object.entries(data.response).map((item) => {
          if (item) {
            return { date: item[0], data: item[1].sort(comparePriority) };
          }
        });

        let currentTemplate = [];
        for (let i = 0; i < weekSchedule.length; i++) {
          let sameDate = templateSchedule.find(
            (item) => item.date === weekSchedule[i].date
          );
          if (sameDate) {
            currentTemplate.push({
              date: weekSchedule[i].date,
              data: [...weekSchedule[i].data, ...sameDate.data].sort(
                comparePriority
              ),
            });
          } else {
            currentTemplate.push(weekSchedule[i]);
          }
        }
        if (currentTemplate.length != 0) {
          defaultSchedule = currentTemplate;
        }
      }
    } catch (error) {
      console.log("ERROR:", error);
    }
    let selectedDay = format(new Date(newDate), "yyyy-MM-dd");
    let today = handleDayInWeekV2(selectedDay);
    let dayInWeekSelectedDay = handleDayInWeekV2(selectedDay);
    let needToFill = true;
    let defaultData = [];
    try {
      const response = await fetch(
        `${DOMAIN}/api/schedule?fromDate=${selectedDay}&needOrder=1&toDate=${selectedDay}`
      );
      const data = await response.json();
      let isCustomedData = data.response.isCustomed[selectedDay];
      let nonCustomedData = data.response.nonCustomed[selectedDay];
      if (!isCustomedData && !nonCustomedData) {
        needToFill = true;
      } else {
        needToFill = false;
      }
      if (needToFill) {
        setSelectedDateData([{ date: dayInWeekSelectedDay, data: [] }]);
        if (defaultSchedule)
          defaultData = defaultSchedule.find((item) => item.date == today).data;
        setSelectedDateData([
          { date: dayInWeekSelectedDay, data: defaultData },
        ]);
        setIsLoadingSelectDate(false);
      } else if (
        data.response.isCustomed &&
        Object.keys(data.response.isCustomed).length === 0 &&
        Object.getPrototypeOf(data.response.isCustomed) === Object.prototype
      ) {
        let y = [];
        if (
          data.response.nonCustomed &&
          Object.keys(data.response.nonCustomed).length === 0 &&
          Object.getPrototypeOf(data.response.nonCustomed) === Object.prototype
        ) {
          y = [{ date: dayInWeekSelectedDay, data: [] }];
        } else {
          y = [
            {
              date: dayInWeekSelectedDay,
              data: data?.response?.nonCustomed[selectedDay]?.sort(
                comparePriority
              ),
            },
          ];
        }
        if (y[0].data) {
          setSelectedDateData(y);
        } else {
          setSelectedDateData([{ date: dayInWeekSelectedDay, data: [] }]);
        }
        setIsLoadingSelectDate(false);
      } else {
        let x = [];
        x = Object.entries(data.response.isCustomed).map((item) => {
          if (item[1]) {
            return { date: item[0], data: item[1] };
          }
          return { date: item[0], data: [] };
        });
        let y = [];
        if (
          data.response.nonCustomed &&
          Object.keys(data.response.nonCustomed).length === 0 &&
          Object.getPrototypeOf(data.response.nonCustomed) === Object.prototype
        ) {
          y = [{ date: dayInWeekSelectedDay, data: [] }];
        } else {
          y = [
            {
              date: dayInWeekSelectedDay,
              data: data?.response?.nonCustomed[selectedDay]?.sort(
                comparePriority
              ),
            },
          ];
        }
        let combineData = [...y[0].data, ...x[0].data];
        let q = [
          {
            date: dayInWeekSelectedDay,
            data: combineData.sort(comparePriority),
          },
        ];
        setSelectedDateData(q);
        setIsLoadingSelectDate(false);
      }
    } catch (error) {
      console.log("Error", error);
      setSelectedDateData([{ date: selectedDay, data: [] }]);
      setIsLoadingSelectDate(false);
    }
  };

  const handleDeleteRowSelectedDate = async () => {
    try {
      await fetch(`${DOMAIN}/api/schedule/delete`, {
        method: "DELETE",
        body: JSON.stringify({ ids: idDelete }),
        headers: {
          "content-type": "application/json",
        },
      });
      setToastProps({ content: "Delete successfully!" });
    } catch (error) {
      console.log("ERROR", error);
      setToastProps({
        content: error,
        error: true,
      });
    }
  };

  const handleDeleteRow = async () => {
    setIsLoading(true);
    try {
      await fetch(`${DOMAIN}/api/schedule-default/`, {
        method: "DELETE",
        body: JSON.stringify({ ids: idDelete }),
        headers: {
          "content-type": "application/json",
        },
      });
      setToastProps({ content: "Delete successfully!" });
    } catch (error) {
      console.log("ERROR", error);
      setToastProps({
        content: error,
        error: true,
      });
      setIsLoading(false);
    }
  };

  const handleGetData = (data) => {
    setDefaultScheduleData(data);
  };

  useEffect(() => {
    fetchData();
    handleGetFutureDataDate();
    handleGetOrderWithOutSchedule();
    setSelectedDate(format(new Date(selectedDate), "yyyy-MM-dd"));
  }, []);

  useEffect(() => {
    fetchDataDefaultToday(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    if (isAssignedOrder) {
      fetchDataDefaultToday(selectedDate);
      handleGetOrderWithOutSchedule();
    }
  }, [isAssignedOrder]);

  return (
    <div style={styles.container}>
      <div
        style={
          size.width < 1265
            ? styles.tabContainerWithFlex
            : styles.tabContainerNoFlex
        }
      >
        <TitleBar title="Delivery Schedule Management" primaryAction={null} />
        <Layout>
          {toastMarkup}
          <div>
            <Card>
              <Tabs
                tabs={TAB_ENUMS}
                selected={selected}
                onSelect={handleTabChange}
              >
                {isLoading ? (
                  <div style={styles.loadingContainer}>
                    <LoadingDot />
                  </div>
                ) : (
                  <div style={styles.mapRowItemContainer}>
                    {/* Tab 0 */}
                    {selected == 0 && (
                      <>
                        <b
                          id="selected_schedule"
                          style={styles.textCategoriesStyle}
                        >
                          Delivery Schedule for{" "}
                          {selectedDate
                            ? `${handleDayInWeek(selectedDate)} the ${format(
                                new Date(selectedDate),
                                "dd MMM yyyy"
                              )}`
                            : "Selected Day"}
                        </b>
                        <b style={{ marginTop: 20 }}>Jump to date</b>
                        <b
                          style={styles.textSelectDayContainer}
                          onClick={() => {
                            setSelectedDate(
                              format(
                                add(new Date(selectedDate), { days: -1 }),
                                "yyyy-MM-dd"
                              )
                            );
                          }}
                        >
                          Day Before
                        </b>
                        <b
                          style={styles.textSelectDayContainer}
                          onClick={() => {
                            setSelectedDate(
                              format(
                                add(new Date(selectedDate), { days: 1 }),
                                "yyyy-MM-dd"
                              )
                            );
                          }}
                        >
                          Day After
                        </b>
                        <div style={styles.buttonCalendarContainer}>
                          <DatePicker
                            dateFormat="yyyy/MM/dd"
                            selected={new Date(selectedDate)}
                            onChange={(date) => setSelectedDate(date)}
                            customInput={<ExampleCustomInput />}
                          />
                        </div>
                        <b style={styles.titleStyleV1}>Schedule Data</b>
                        <b style={styles.titleStyleV2}>
                          This day is custom set and will not be overwritten by
                          changes to the default table.
                        </b>
                        {selectedDateData[0] &&
                          selectedDateData[0].data.length == 1 && (
                            <b style={styles.titleStyleV2}>
                              You can not delete the last time slot in this
                              date.
                            </b>
                          )}
                        {isLoadingSelectDate ? (
                          <LoadingDot />
                        ) : (
                          <div>
                            {selectedDateData && selectedDateData.length ? (
                              selectedDateData.map((item, dayIndex) => {
                                return (
                                  <Day
                                    isSelectedDay={true}
                                    dayData={item}
                                    dayIndex={dayIndex}
                                    key={dayIndex}
                                    setData={setSelectedDateData}
                                    allData={selectedDateData}
                                    handleAddRow={handleAddRowSpecialDate}
                                    handleRemoveRow={handleRemoveRowSpecialDate}
                                    isSave={true}
                                    isDate={false}
                                    isPlacedOrders={true}
                                    handleSaveDay={handleSaveDaySelectedDate}
                                    saveDay={saveDaySelectedDate}
                                    orderNotInSchedule={
                                      orderNotInSchedule?.map(
                                        (order) => order?.name
                                      ) || []
                                    }
                                    setIsAssignedOrder={setIsAssignedOrder}
                                  />
                                );
                              })
                            ) : (
                              <></>
                            )}
                          </div>
                        )}

                        <b style={styles.noteStyle}>
                          Pending delivery orders with no assigned delivery
                          slots.
                        </b>
                        <div style={styles.itemNotInSchedule}>
                          {orderNotInSchedule.map((item, index) => {
                            return (
                              <b
                                style={styles.futureDateContainerDetail}
                                key={index}
                                onClick={() => {
                                  gotoOrder(item.id);
                                }}
                              >
                                {item.name}
                              </b>
                            );
                          })}
                        </div>

                        {futureCustom && futureCustom.length !== 0 && (
                          <b style={styles.noteStyle}>
                            These future dates have custom settings
                          </b>
                        )}
                        {futureCustom.map((item, index) => {
                          return (
                            <b
                              style={styles.futureDateContainerDetailV2}
                              key={index}
                              target="selected_schedule"
                              onClick={() => {
                                setSelectedDate(item);
                                window.scrollTo({
                                  top: 0,
                                  left: 0,
                                  behavior: "smooth",
                                });
                              }}
                            >
                              {handleDayInWeek(item)},{" "}
                              {format(new Date(item), "yyyy/MM/dd")}
                            </b>
                          );
                        })}
                      </>
                    )}
                    {/* Tab 1 */}
                    {selected == 1 && (
                      <>
                        <b style={styles.textCategoriesStyle}>
                          Delivery Schedule Defaults
                        </b>
                        <div>
                          {defaultScheduleData.map((dayData, dayIndex) => (
                            <Day
                              isLoading={isLoading}
                              dayData={dayData}
                              dayIndex={dayIndex}
                              key={dayIndex}
                              setData={setDefaultScheduleData}
                              allData={defaultScheduleData}
                              handleAddRow={handleAddRow}
                              handleRemoveRow={handleRemoveRow}
                              handleSaveDay={handleSaveDay}
                              saveDay={saveDay}
                              isPlacedOrders={false}
                            />
                          ))}
                        </div>
                      </>
                    )}
                    {/* Tab 2 */}
                    {selected == 2 && (
                      <>
                        <b style={styles.textCategoriesStyle}>Cutoff</b>
                        <div style={{ margin: "20px 0" }}>
                          <CutOffComponents />
                        </div>
                      </>
                    )}
                  </div>
                )}
              </Tabs>
            </Card>
          </div>
        </Layout>
      </div>
    </div>
  );
};
