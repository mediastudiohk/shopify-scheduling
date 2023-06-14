import {
    Layout,
    TextField,
    Select,
    Icon,
    Tabs,
    Card,
} from "@shopify/polaris";
import { TitleBar, useAuthenticatedFetch, Toast } from "@shopify/app-bridge-react";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
    DeleteMajor, CalendarMajor
} from '@shopify/polaris-icons';
import DatePicker from "react-datepicker";
import { styles } from "../styles";
import { add, format } from "date-fns";
import { areaOption, customerTypeOption, districtOption } from "../constants/area";
import { dayOfWeeks } from "../constants/dayOfWeek";
import "../css/dot-chasing.css";
import "../css/tab-effect.css";
import "../css/tab-sample.css";
import "react-datepicker/dist/react-datepicker.css";


function useWindowSize() {
    const [windowSize, setWindowSize] = React.useState({
        width: 0,
        height: 0,
    });
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            const handleResize = () => {
                setWindowSize({
                    width: window.innerWidth,
                    height: window.innerHeight,
                });
            };
            window.addEventListener('resize', handleResize);
            handleResize();
            return () => window.removeEventListener('resize', handleResize);
        }
    }, []);
    return windowSize;
}


export const DeliveryDefault = () => {
    const size = useWindowSize()
    const [selected, setSelected] = useState(0);
    const emptyToastProps = { content: null };
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingSelectDate, setIsLoadingSelectDate] = useState(false);
    const [toastProps, setToastProps] = useState(emptyToastProps);
    const [defaultScheduleData, setDefaultScheduleData] = useState([])
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
    const [selectedDateData, setSelectedDateData] = useState([])
    const [idDelete, setIdDelete] = useState([])
    const [futureCustom, setFutureCustom] = useState([])
    const [orderNotInSchedule, setOrderNotInSchedule] = useState([])
    const [lastItemSelectedDate, setLastItemSelectedDate] = useState([])
    const fetch = useAuthenticatedFetch();
    const domain = 'https://msh.api.vmodev.link'
    const storeName = 'vmo-staging'


    const handleTabChange = useCallback(
        (selectedTabIndex) => setSelected(selectedTabIndex),
        [],
    );

    const tabs = [
        {
            id: 'all-customers-1',
            content: 'Schedule Default',
            accessibilityLabel: 'All customers',
            panelID: 'all-customers-content-1',
        },
        {
            id: 'accepts-marketing-1',
            content: 'Special Day',
            panelID: 'accepts-marketing-content-1',
        },
    ];

    const toastMarkup = toastProps.content && !isLoading && (
        <Toast {...toastProps} onDismiss={() => setToastProps(emptyToastProps)} />
    );

    const gotoOrder = (id) => {
        if (id) {
            let orderId = id.split('gid://shopify/Order/').at(1)
            let url = `https://admin.shopify.com/store/${storeName}/orders/`
            window.open(url + orderId, '_blank');
        }
        else { console.log('id is not defined') }
    }

    const comparePriority = (a, b) => {
        if (a.priority && b.priority) {
            return a.priority - b.priority;
        }
        return null
    }

    const comparePrioritySelectedDate = (a, b) => {
        if (a.priority && b.priority) {
            return a.priority - b.priority;
        }
        return null
    }

    const handleDayInWeek = (date) => {
        switch (new Date(date).getDay()) {
            case 0:
                return "Sunday";
            case 1:
                return "Monday";
            case 2:
                return "Tuesday";
            case 3:
                return "Wednesday";
            case 4:
                return "Thursday";
            case 5:
                return "Friday";
            case 6:
                return "Saturday";
        }
    }

    const handleDayInWeekV2 = (date) => {
        switch (new Date(date).getDay()) {
            case 0:
                return "Sun";
            case 1:
                return "Mon";
            case 2:
                return "Tue";
            case 3:
                return "Wed";
            case 4:
                return "Thu";
            case 5:
                return "Fri";
            case 6:
                return "Sat";
        }
    }

    const ExampleCustomInput = React.forwardRef(({ value, onClick }, ref) => (
        <div style={styles.buttonCalendar} onClick={onClick}>
            <div>
                {value}
            </div>
            <div style={styles.iconCalendarContainer}>
                <div style={styles.iconCalendar}>
                    <Icon
                        source={CalendarMajor}
                        color={"black"}
                    />
                </div>
            </div>



        </div>
    ));

    const LoadingDot = () => {
        return (
            <div style={styles.loadingContainerIndicator}>
                <div className="sk-chase">
                    <div className="sk-chase-dot" style={{ color: 'grey' }}>●</div>
                    <div className="sk-chase-dot" style={{ color: 'grey' }}>●</div>
                    <div className="sk-chase-dot" style={{ color: 'grey' }}>●</div>
                    <div className="sk-chase-dot" style={{ color: 'grey' }}>●</div>
                    <div className="sk-chase-dot" style={{ color: 'grey' }}>●</div>
                    <div className="sk-chase-dot" style={{ color: 'grey' }}>●</div>
                </div>
            </div>

        )
    }

    const handleGetFutureDataDate = async () => {
        try {
            const response = await fetch(`${domain}/api/schedule/custom-date?fromDate=${format(new Date(), 'yyyy-MM-dd')}`)
            const data = await response.json()
            setFutureCustom(data.response)
        }
        catch (e) {
            console.log('Error:', e)
        }
    }

    const handleAddRow = (dayIndex, date, allData, isPlacedOrders, item) => {
        const newRow = {
            "schedule_date": date,
            "comment": "",
            "customer_type": "Retail",
            "maximum_order": 0,
            "isCustomed": true,
            "area": "",
            "district": ""
        }
        // Call API Create
        // handleCreateRow(newRow)
        let newAllData = [...allData]
        newAllData[dayIndex].data.push(newRow)
        setDefaultScheduleData(newAllData)

    }


    const handleRemoveRow = (rowIndex, dayIndex, id, allData) => {
        let newAllData = [...allData]
        newAllData[dayIndex].data.splice(rowIndex, 1)
        setDefaultScheduleData(newAllData)
        if (id) setIdDelete([...idDelete, id])
        // handleDeleteRow(index, day, id)
    };

    const handleAddRowSpecialDate = (dayIndex, date, allData, isPlacedOrders, item) => {
        let a = []
        const newRow = {
            "schedule_date": selectedDate,
            "comment": "",
            "customer_type": "Retail",
            "maximum_order": 0,
            "is_customed": true,
            "area": "",
            "district": "",
            "priority": "",
            "schedule_orders": a
        }
        // Call API Create
        // handleCreateRow(newRow)
        let newAllData = [...selectedDateData]
        newAllData[dayIndex].data.push(newRow)
        // newAllData[dayIndex].data.push(newRow)
        setSelectedDateData(newAllData)
    }

    const handleRemoveRowSpecialDate = async (rowIndex, dayIndex, id, allData) => {
        let newAllData = [...selectedDateData]
        setLastItemSelectedDate([])
        const handleDeleteRow = () => {
            newAllData[dayIndex].data.splice(rowIndex, 1)
            setSelectedDateData(newAllData)
        }
        if (allData[0].data?.length > 1) {
            if (id) {
                setIdDelete([...idDelete, id])
            }
            handleDeleteRow()
        } else {
            let newLastItem = [...allData[0].data]
            setLastItemSelectedDate(newLastItem)
            handleDeleteRow()
        }

        // check item length trước khi có 1 schedule (đã có orders thì không xóa được)
        // if id có: sửa id cuối với maximum_order = 0 
        // if id null : tạo 1 bản ghi có custom schedule-order mới với maximum_order = 0

    };


    const saveDay = (item, allData, day, row) => {
        let newRowItem = allData[day].data[row]
        newRowItem['comment'] = item.comment
        newRowItem['area'] = item.area
        newRowItem['district'] = item.district
        newRowItem['customer_type'] = item.customer_type
        newRowItem['maximum_order'] = item.maximum_order

        let newDayItem = [...allData[day].data]
        newDayItem.splice(row, 1, newRowItem)

        let newAlldata = [...allData]
        // newAlldata.splice(day, 1, newAlldata)

        setDefaultScheduleData(newAlldata)
    }

    const saveDaySelectedDate = (item, allData, day, row) => {
        let newRowItem = allData[day].data[row]
        newRowItem['comment'] = item.comment
        newRowItem['area'] = item.area
        newRowItem['district'] = item.district
        newRowItem['customer_type'] = item.customer_type
        newRowItem['maximum_order'] = item.maximum_order

        let newDayItem = [...allData[day].data]
        newDayItem.splice(row, 1, newRowItem)

        let newAlldata = [...allData]
        // newAlldata.splice(day, 1, newAlldata)

        setSelectedDateData(newAlldata)
    }

    const handleSaveDay = (day, date, data) => {
        setIsLoading(true)
        let x = 0
        let newData = data.map((item, index) => {
            return { ...item, priority: index, day_in_week: date, id_schedule_default: item.id_schedule_default || null, }
        })
        saveAll(newData)
        if (idDelete.length > 0 && idDelete && idDelete != [undefined]) {
            handleDeleteRow()
        }
    }

    const handleLastItemSelectedDate = (item) => {
        let newItem = [{ ...item[0], maximum_order: 0, schedule_date: selectedDate, isCustomed: true }]
        saveAllSelectedDate(newItem)
    }

    const handleSaveDaySelectedDate = (day, date, data) => {
        let newData = data?.map((item, index) => {
            return { ...item, priority: index + 1, schedule_date: selectedDate }
        })

        if (newData.length && newData.length !== 0) {
            saveAllSelectedDate(newData)
        }

        if (idDelete.length > 0 && idDelete && idDelete != [undefined]) {
            handleDeleteRowSelectedDate()
        }
        if (lastItemSelectedDate.length != 0) {
            handleLastItemSelectedDate(lastItemSelectedDate)
        }
    }

    const handleCheckValidateMaximumOrders = (items) => {
        let nullItem = items.find((item) =>
            item.maximum_order < item.schedule_orders.length

        )


        return nullItem ? false : true
    }

    const saveAllSelectedDate = async (items) => {
        setLastItemSelectedDate([])
        try {
            let response = await fetch(`${domain}/api/schedule/bulk`, {
                method: "POST",
                body: JSON.stringify(items),
                headers: {
                    "content-type": 'application/json'
                }
            })
            let data = await response.json()
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
            console.log('ERROR', error);
            setToastProps({
                content: error,
                error: true,
            });
        }
    }

    const saveAll = async (items) => {
        try {
            let response = await fetch(`${domain}/api/schedule-default/bulk`, {
                method: "POST",
                body: JSON.stringify(items),
                headers: {
                    "content-type": 'application/json'
                }
            })
            if (response.status === 200) {
                setToastProps({ content: "Update Schedules Successfully!" });
                fetchData();
            } else {
                setToastProps({
                    content: "Some required fields are not filled!",
                })
                fetchData();
            }
        } catch (error) {
            console.log('Error:', error)
        }
    }

    const handleGetOrderWithOutSchedule = async () => {
        try {
            const response = await fetch(`${domain}/api/schedule-order/order-without-schedule`);
            const data = await response.json();
            setOrderNotInSchedule(data.response)
        } catch (error) {
            console.log('Error:', error)
        }
    }

    const fetchData = async () => {
        setIsLoading(true)
        let week = dayOfWeeks
        try {
            const response = await fetch(`${domain}/api/schedule-default/`);
            const data = await response.json();
            if (data.response
                && Object.keys(data.response).length === 0
                && Object.getPrototypeOf(data.response) === Object.prototype
            ) {
                let weekSchedule = week.map((item) => {
                    return { date: item, data: [] }
                })
                setDefaultScheduleData(weekSchedule)
                setIsLoading(false)
            } else {
                let weekSchedule = week.map((item) => {
                    return { date: item, data: [] }
                })

                let templateSchedule = Object.entries(data.response).map((item) => {
                    if (item) {
                        return { date: item[0], data: item[1].sort(comparePriority) }
                    }
                })

                let currentTemplate = [];
                for (let i = 0; i < weekSchedule.length; i++) {
                    let sameDate = templateSchedule.find((item) => item.date === weekSchedule[i].date)
                    if (sameDate) {
                        currentTemplate.push({ date: weekSchedule[i].date, data: [...weekSchedule[i].data, ...sameDate.data].sort(comparePriority) })
                    } else {
                        currentTemplate.push(weekSchedule[i])
                    }
                }
                setIsLoading(false)
                if (currentTemplate.length != 0) {
                    handleGetData(currentTemplate)
                    setIsLoading(false)
                    setToastProps({ content: "Get Orders Successfully!" });
                }
            }
        } catch (error) {
            setToastProps({
                content: error,
                error: true,
            });
            setIsLoading(false)
            console.log('ERROR:', error);
        }
    }

    // get first time
    const fetchDataDefaultToday = async (newDate) => {
        setIsLoadingSelectDate(true)
        let defaultSchedule = []
        let week = dayOfWeeks
        try {
            const response = await fetch(`${domain}/api/schedule-default/`);
            const data = await response.json();
            if (data.response
                && Object.keys(data.response).length === 0
                && Object.getPrototypeOf(data.response) === Object.prototype
            ) {
                let weekSchedule = week.map((item) => {
                    return { date: item, data: [] }
                })
                defaultSchedule = weekSchedule
                // setDefaultScheduleDataNonChange(weekSchedule)
            } else {
                let weekSchedule = week.map((item) => {
                    return { date: item, data: [] }
                })

                let templateSchedule = Object.entries(data.response).map((item) => {
                    if (item) {
                        return { date: item[0], data: item[1].sort(comparePriority) }
                    }
                })

                let currentTemplate = [];
                for (let i = 0; i < weekSchedule.length; i++) {
                    let sameDate = templateSchedule.find((item) => item.date === weekSchedule[i].date)
                    if (sameDate) {
                        currentTemplate.push({ date: weekSchedule[i].date, data: [...weekSchedule[i].data, ...sameDate.data].sort(comparePriority) })
                    } else {
                        currentTemplate.push(weekSchedule[i])
                    }
                }
                if (currentTemplate.length != 0) {
                    // setDefaultScheduleDataNonChange(currentTemplate)
                    defaultSchedule = currentTemplate
                }
            }
        } catch (error) {
            console.log('ERROR:', error);
        }
        let selectedDay = format(new Date(newDate), 'yyyy-MM-dd')
        let today = handleDayInWeekV2(selectedDay)
        let dayInWeekSelectedDay = handleDayInWeekV2(selectedDay)
        let needToFill = true
        let defaultData = []
        try {
            const response = await fetch(`${domain}/api/schedule?fromDate=${selectedDay}&needOrder=1&toDate=${selectedDay}`);
            const data = await response.json()
            let isCustomedData = data.response.isCustomed[selectedDay]
            let nonCustomedData = data.response.nonCustomed[selectedDay]
            if (!isCustomedData && !nonCustomedData) {
                needToFill = true
            } else {
                needToFill = false
            }
            // checkIfDayIsCustomed(selectedDay, data.response)
            if (needToFill) {
                setSelectedDateData([{ date: dayInWeekSelectedDay, data: [] }])
                if (defaultSchedule) defaultData = defaultSchedule.find(item => item.date == today).data
                setSelectedDateData([{ date: dayInWeekSelectedDay, data: defaultData }])
                setIsLoadingSelectDate(false)
                // error here
            }
            else if (data.response.isCustomed
                && Object.keys(data.response.isCustomed).length === 0
                && Object.getPrototypeOf(data.response.isCustomed) === Object.prototype) {
                let y = []
                if (data.response.nonCustomed && Object.keys(data.response.nonCustomed).length === 0 && Object.getPrototypeOf(data.response.nonCustomed) === Object.prototype) {
                    y = [{ date: dayInWeekSelectedDay, data: [] }]
                } else {
                    y = [{ date: dayInWeekSelectedDay, data: data?.response?.nonCustomed[selectedDay]?.sort(comparePriority) }]
                }
                if (y[0].data) { setSelectedDateData(y) } else { setSelectedDateData([{ date: dayInWeekSelectedDay, data: [] }]) }
                setIsLoadingSelectDate(false)
            }
            else {
                let x = []
                x = Object.entries(data.response.isCustomed).map((item) => {
                    if (item[1]) {
                        return { date: item[0], data: item[1] }
                    }
                    return { date: item[0], data: [] }
                })
                let y = []
                if (data.response.nonCustomed && Object.keys(data.response.nonCustomed).length === 0 && Object.getPrototypeOf(data.response.nonCustomed) === Object.prototype) {
                    y = [{ date: dayInWeekSelectedDay, data: [] }]
                } else {
                    y = [{ date: dayInWeekSelectedDay, data: data?.response?.nonCustomed[selectedDay]?.sort(comparePriority) }]
                }
                let combineData = [...y[0].data, ...x[0].data]
                let q = [{ date: dayInWeekSelectedDay, data: combineData.sort(comparePrioritySelectedDate) }]
                setSelectedDateData(q)
                setIsLoadingSelectDate(false)
            }
        } catch (error) {
            console.log('Error', error)
            setSelectedDateData([{ date: selectedDay, data: [] }])
            setIsLoadingSelectDate(false)
        }
    }

    const handleDeleteRowSelectedDate = async () => {
        try {
            await fetch(`${domain}/api/schedule/delete`, {
                method: "DELETE",
                body: JSON.stringify({ ids: idDelete }),
                headers: {
                    "content-type": 'application/json'
                }
            })
            setToastProps({ content: "Delete successfully!" });
            // fetchData()
        } catch (error) {
            console.log('ERROR', error);
            setToastProps({
                content: error,
                error: true,
            });
        }
    }

    const handleDeleteRow = async () => {
        setIsLoading(true)
        try {
            await fetch(`${domain}/api/schedule-default/`, {
                method: "DELETE",
                body: JSON.stringify({ ids: idDelete }),
                headers: {
                    "content-type": 'application/json'
                }
            })
            setToastProps({ content: "Delete successfully!" });
            // fetchData()

        } catch (error) {
            console.log('ERROR', error);
            setToastProps({
                content: error,
                error: true,
            });
            setIsLoading(false)
        }
    }

    const handleGetData = (data) => {
        setDefaultScheduleData(data)
        // setDefaultScheduleDataNonChange(data)
    }

    useEffect(() => {
        fetchData();
    }, [])

    useEffect(() => {
        handleGetFutureDataDate();
    }, [])

    useEffect(() => {
        handleGetOrderWithOutSchedule()
    }, [])

    useEffect(() => {
        setSelectedDate(format(new Date(selectedDate), 'yyyy-MM-dd'))
    }, [])

    // useEffect(() => {
    //     handleGetSelectedDate(selectedDate);
    // }, [selectedDate])

    useEffect(() => {
        fetchDataDefaultToday(selectedDate);
    }, [selectedDate])

    return (
        <div style={styles.container}>
            <div style={size.width < 1265 ? { display: 'flex', padding: 20 } : { padding: 20 }}>
                <TitleBar title="Delivery Schedule Management" primaryAction={null} />
                <Layout>
                    {toastMarkup}
                    <div style={{}}>
                        <Card>
                            <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange}>
                                {isLoading ?
                                    <div style={styles.loadingContainer}>
                                        <LoadingDot />
                                    </div>
                                    :
                                    <div style={styles.mapRowItemContainer}>
                                        {!selected ? <>
                                            <b style={styles.textCategoriesStyle}>Delivery Schedule Defaults</b>
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

                                                    />)
                                                )}

                                            </div>
                                        </> : <>
                                            <b id="selected_schedule" style={styles.textCategoriesStyle}>Delivery Schedule for {selectedDate ? `${handleDayInWeek(selectedDate)} the ${format(new Date(selectedDate), 'dd MMM yyyy')}` : 'Selected Day'}</b>
                                            <b style={{ marginTop: 20 }}>
                                                Jump to date
                                            </b>
                                            <b style={styles.textSelectDayContainer} onClick={() => {
                                                setSelectedDate(format(add(new Date(selectedDate), { days: -1 }), 'yyyy-MM-dd'))
                                            }}>
                                                Day Before
                                            </b>
                                            <b style={styles.textSelectDayContainer} onClick={() => {
                                                setSelectedDate(format(add(new Date(selectedDate), { days: 1 }), 'yyyy-MM-dd'))
                                            }}>
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
                                            <b style={{ marginTop: 20 }}>
                                                Schedule Data
                                            </b>
                                            <b style={{ marginTop: 12 }}>
                                                This day is custom set and will not be overwritten by changes to the default table.
                                            </b>
                                            {selectedDateData[0].data.length == 1 && (
                                                <b style={{ marginTop: 12 }}>
                                                    You can not delete the last time slot in this date.
                                                </b>)
                                            }
                                            {isLoadingSelectDate ? <LoadingDot /> :
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
                                                                />
                                                            )
                                                        })
                                                    ) :
                                                        <>
                                                        </>
                                                    }
                                                </div>}


                                            <b style={{ marginTop: 12, fontSize: 20, marginBottom: 8 }}>
                                                These not closed/canceled orders have no assigned delivery slot
                                            </b>
                                            <div style={{ alignItems: 'baseline', width: 1200, flexWrap: 'wrap', display: 'flex', }}>
                                                {orderNotInSchedule.map((item, index) => {
                                                    return (
                                                        <b style={styles.futureDateContainerDetail} key={index}
                                                            onClick={() => { gotoOrder(item.id) }}>
                                                            {item.name}
                                                        </b>)
                                                })}
                                            </div>

                                            {futureCustom && futureCustom.length !== 0 && (
                                                <b style={{ marginTop: 12, fontSize: 20, marginBottom: 8 }}>
                                                    These future dates have custom settings
                                                </b>
                                            )}
                                            {futureCustom.map((item, index) => {
                                                return (<b style={styles.futureDateContainerDetail} key={index} target="selected_schedule" onClick={() => {
                                                    setSelectedDate(item)
                                                    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
                                                }}>
                                                    {handleDayInWeek(item)}, {format(new Date(item), 'yyyy/MM/dd')}
                                                </b>)
                                            })}
                                        </>}
                                    </div>
                                }
                            </Tabs>
                        </Card>
                    </div>
                </Layout>
            </div>
        </div>
    );
}

const Day = ({ dayData, dayIndex, setData, allData, isDate = true, isSave = true, index, handleAddRow, handleRemoveRow, handleSaveDay, isPlacedOrders = false, isLoading, saveDay }) => {
    const [isSavePress, setIsSavePressed] = useState(false)
    const emptyToastProps = { content: null };
    const [toastProps, setToastProps] = useState(emptyToastProps);
    const toastMarkup = toastProps.content && !isLoading && (
        <Toast {...toastProps} onDismiss={() => setToastProps(emptyToastProps)} />
    );
    const handleDayInWeek = (date) => {
        switch (date) {
            case "Sun":
                return "Sunday";
            case "Mon":
                return "Monday";
            case "Tue":
                return "Tuesday";
            case "Wed":
                return "Wednesday";
            case "Thu":
                return "Thursday";
            case "Fri":
                return "Friday";
            case "Sat":
                return "Saturday";
        }
    }


    const handleCheckValidate = () => {
        let nullItem = dayData.data.find((item) => item.area === '' || item.comment === '' || item.maximum_order === '')
        return nullItem ? false : true
    }

    const handleSaveDayValidate = () => {
        if (handleCheckValidate()) {
            handleSaveDay(day, dayData.date, dayData.data)
            setIsSavePressed(true)
            setTimeout(() => {
                setIsSavePressed(false)
            }, 4000);
        } else {
            // setToastProps({
            //     content: "Please fill all required fields!",
            //     error: true,
            // });
            setIsSavePressed(true)
            setTimeout(() => {
                setIsSavePressed(false)
            }, 4000);
        }

    }
    let day = dayIndex
    return (
        <div key={day}>
            {toastMarkup}
            <div style={styles.textDateStyle}>
                {isDate && (
                    <div>
                        {handleDayInWeek(dayData.date)}
                    </div>
                )}
            </div>
            {dayData.data.length != 0 && (
                <div style={{ marginLeft: 4, display: 'flex', flexDirection: 'row', }}>
                    <b style={isPlacedOrders ? { width: '18%' } : { width: '21%' }}>
                        Comment
                    </b>
                    <b style={isPlacedOrders ? { width: '13%' } : { width: '15%' }}>
                        Area
                    </b>
                    <b style={isPlacedOrders ? { width: '13%' } : { width: '15%' }}>
                        District
                    </b>
                    <b style={isPlacedOrders ? { width: '13%' } : { width: '15%' }}>
                        Customer Type
                    </b>

                    <b style={isPlacedOrders ? { width: '14%' } : { width: '19%' }}>
                        Maximum Orders
                    </b>
                    {isPlacedOrders && (
                        <b style={{ width: '16%' }}>
                            Placed Orders
                        </b>
                    )}
                    <b>
                        Move
                    </b>
                </div>
            )}
            {dayData.data.map((rowData, rowIndex) => {
                return <Row
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
                />
            })}

            <div >
                {dayData.data.length != 0 && (<div style={{ paddingTop: 12 }}>
                    Enter a 'maximum orders' value of 0 to hide a slot from the customers.
                </div>)
                }
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <div style={styles.buttonAddRowContainer}
                        onClick={() => {
                            if (handleCheckValidate()) {
                                !isLoading && handleAddRow(dayIndex, dayData.date, allData, isPlacedOrders, dayData)
                            } else { null }
                        }}>
                        <b>
                            Add Row
                        </b>
                    </div>
                    {(
                        <div style={styles.buttonSaveContainer}
                            onClick={() => {
                                handleSaveDayValidate()
                            }}>
                            <b>
                                Save
                            </b>
                        </div>
                    )}
                </div>
            </div>

        </div>
    )
}

const Row = ({ rowData, rowIndex, dayIndex, setData, allData, handleDeleteRow, isPlacedOrders, day, isLoading, saveDay, dayData, isSavePress }) => {
    const [comment, setComment] = useState('');
    const [area, setArea] = useState('');
    const [district, setDistrict] = useState('');
    const [customerType, setCustomerType] = useState('');
    const [maximumOrders, setMaximumOrders] = useState('')
    const [placedOrders, setPlacedOrders] = useState([])
    const [districtCustom, setDistrictCustom] = useState([])
    const storeName = 'vmo-staging'

    const gotoOrder = (id) => {
        if (id) {
            let orderId = id.split('gid://shopify/Order/').at(1)
            let url = `https://admin.shopify.com/store/${storeName}/orders/`
            window.open(url + orderId, '_blank');
        }
        else { console.log('id is not defined') }
    }

    useEffect(() => {
        rowData && (
            setComment(rowData.comment),
            setArea(rowData.area),
            setDistrict(rowData.district),
            setCustomerType(rowData.customer_type),
            setMaximumOrders(rowData.maximum_order),
            rowData?.schedule_orders && setPlacedOrders(rowData?.schedule_orders)
            // getDistrictOption(rowItem.area)
        )
    }, [allData])

    const getDistrictOption = (area) => {
        let districtCustomOption = districtOption.find((item) => item.area === area)
        setDistrictCustom([...districtCustomOption.district,])
    }

    useEffect(async () => {
        (async () => {
            let districtCustomOption = districtOption.find((item) => item.area === rowData.area)
            setDistrictCustom(districtCustomOption?.district)
        })();
    }, [])

    const handleMoveUp = ({ dayIndex, rowIndex, allData }) => {
        //from
        let tempNewData = [...allData[dayIndex].data]
        ///oject in day item
        let tempItemFrom = allData[dayIndex].data[rowIndex]
        //move up
        if (rowIndex >= 1) {
            tempNewData.splice(rowIndex, 1, allData[dayIndex].data[rowIndex - 1])
            tempNewData.splice(rowIndex - 1, 1, tempItemFrom)
        }
        //day in week item render
        let itemDate = {
            data: tempNewData,
            date: allData[dayIndex].date
        }
        let newAlldata = [...allData]
        newAlldata.splice(dayIndex, 1, itemDate)
        setData(newAlldata)
    }

    const handleMoveDown = ({ dayIndex, rowIndex, allData }) => {
        //from
        let tempNewData = [...allData[dayIndex].data]
        ///oject in day item
        let tempItemFrom = allData[dayIndex].data[rowIndex]
        //move up
        if (rowIndex < allData[dayIndex].data.length - 1) {
            tempNewData.splice(rowIndex, 1, allData[dayIndex].data[rowIndex + 1])
            tempNewData.splice(rowIndex + 1, 1, tempItemFrom)
        }
        //day in week item render
        let itemDate = {
            data: tempNewData,
            date: allData[dayIndex].date
        }
        let newAlldata = [...allData]
        newAlldata.splice(dayIndex, 1, itemDate)
        setData(newAlldata)
    }


    return (
        <div key={rowData?.id_schedule_default} style={styles.rowContainer}>
            <div style={styles.commentContainer}>
                {/* <div style={comment ? styles.commentContainer : { backgroundColor: 'red', width: 200, display: 'flex', padding: 2, border: 20, borderColor: 'green' }}> */}
                <TextField
                    error={isSavePress ? comment ? false : "This field is required" : false}
                    disabled={isPlacedOrders && placedOrders.length != 0 ? true : false}
                    label="Comment"
                    placeholder="Enter Comment"
                    value={comment}
                    maxLength="25"
                    onChange={(value) => {
                        setComment(value),
                            saveDay(
                                {
                                    dayIndex,
                                    //
                                    id_schedule_default: rowData.id_schedule_default || null,
                                    schedule_date: rowData.schedule_date,
                                    comment: value,
                                    customer_type: rowData.customer_type,
                                    maximum_order: rowData.maximum_order,
                                    is_customed: rowData.is_customed,
                                    area,
                                    district,
                                    priority: rowData.priority,
                                }, allData, dayIndex, rowIndex
                            )
                    }}
                    autoComplete="off"
                    labelHidden
                />
            </div>
            <div style={styles.selectContainer}>
                <Select
                    error={isSavePress ? area ? false : "This field is required" : false}
                    disabled={isPlacedOrders && placedOrders.length != 0 ? true : false}
                    label="Area"
                    placeholder="Select Area"
                    options={areaOption}
                    onChange={(value) => {
                        getDistrictOption(value)
                        setArea(value),
                            saveDay(
                                {
                                    dayIndex,
                                    //
                                    id_schedule_default: rowData.id_schedule_default,
                                    schedule_date: rowData.schedule_date,
                                    comment,
                                    customer_type: rowData.customer_type,
                                    maximum_order: rowData.maximum_order,
                                    is_customed: rowData.is_customed,
                                    area: value,
                                    district,
                                    priority: rowData.priority,
                                }, allData, dayIndex, rowIndex
                            )
                    }}
                    value={area}
                    labelHidden
                />
            </div>
            <div style={styles.selectContainer}>
                <Select
                    disabled={isPlacedOrders && placedOrders.length != 0 ? true : false}
                    label="District"
                    placeholder="Select District"
                    options={districtCustom}
                    onChange={(value) => {
                        setDistrict(value),
                            saveDay(
                                {
                                    dayIndex,
                                    //
                                    id_schedule_default: rowData.id_schedule_default,
                                    schedule_date: rowData.schedule_date,
                                    comment,
                                    customer_type: rowData.customer_type,
                                    maximum_order: rowData.maximum_order,
                                    is_customed: rowData.is_customed,
                                    area,
                                    district: value,
                                    priority: rowData.priority,
                                }, allData, dayIndex, rowIndex
                            )
                    }}
                    value={district}
                    labelHidden
                />
            </div>
            <div style={styles.selectContainer}>
                <Select
                    disabled={isPlacedOrders && placedOrders.length != 0 ? true : false}
                    label="Customer Type"
                    placeholder="Select Customer Type"
                    options={customerTypeOption}
                    onChange={(value) => {
                        setCustomerType(value),
                            saveDay(
                                {
                                    dayIndex,
                                    //
                                    id_schedule_default: rowData.id_schedule_default,
                                    schedule_date: rowData.schedule_date,
                                    comment,
                                    customer_type: value,
                                    maximum_order: rowData.maximum_order,
                                    is_customed: rowData.is_customed,
                                    area,
                                    district,
                                    priority: rowData.priority,
                                }, allData, dayIndex, rowIndex
                            )
                    }}
                    value={customerType}
                    labelHidden
                />
            </div>
            <div style={styles.selectContainer}>
                <TextField
                    error={isSavePress ? maximumOrders || maximumOrders !== '' ? false : "This field is required" : false}
                    min={0}
                    max={999}
                    type="number"
                    label="Maximum Orders"
                    value={maximumOrders}
                    onChange={(value) => {
                        let formatValue = (value.replace(/[^0-9]/g, '').replace(/(\...*?)\..*/g, '$1').replace(/^0[^.]/, '0'))
                        formatValue < 0 || formatValue > 999 || (value < rowData.schedule_orders?.length && value != '') ?
                            null : (setMaximumOrders(Number(formatValue)),
                                saveDay(
                                    {
                                        dayIndex,
                                        //
                                        id_schedule_default: rowData.id_schedule_default,
                                        schedule_date: rowData.schedule_date,
                                        comment,
                                        customer_type: rowData.customer_type,
                                        maximum_order: formatValue,
                                        is_customed: rowData.is_customed,
                                        area,
                                        district,
                                        priority: rowData.priority,
                                    }, allData, dayIndex, rowIndex
                                ))
                    }}
                    autoComplete="off"
                    labelHidden
                />
            </div>
            {
                isPlacedOrders && (<div style={styles.selectContainerPlaceOrder}>
                    <b style={styles.textPlaceOrder}>
                        {placedOrders.length}
                    </b>
                    <div style={{ display: "flex", flexDirection: 'column', backgroundColor: 'white' }}>
                        {placedOrders.length != 0 && placedOrders.map((item, index) => {
                            return (
                                <b
                                    style={styles.orderContainerDetail} key={index}>
                                    <u onClick={() => {
                                        gotoOrder(item.order_id)
                                    }}>{item.order_name} </u>
                                </b>
                            )
                        })}

                    </div>
                </div>)
            }
            <div style={styles.iconDeleteContainer}>
                <div
                    onClick={() => {
                        if (isPlacedOrders) {
                            (!rowData?.schedule_orders || rowData?.schedule_orders?.length === 0) && !isLoading && handleDeleteRow(rowIndex, dayIndex, rowData.id_schedule, allData)
                        } else
                            !isLoading && handleDeleteRow(rowIndex, dayIndex, rowData.id_schedule_default, allData)
                    }}>
                    <Icon
                        source={DeleteMajor}
                        color={isPlacedOrders ? !rowData?.schedule_orders || rowData?.schedule_orders?.length === 0 ? "black" : "base" : "black"}
                    />
                </div>
            </div>
            <div>
                <div style={styles.buttonMoveContainer}>
                    <div style={styles.buttonMoveRowContainer}
                        onClick={() => handleMoveUp({ dayIndex, rowIndex, rowData, allData })}>
                        <b>
                            Up
                        </b>
                    </div>
                    <div style={styles.buttonMoveRowContainer}
                        onClick={() => handleMoveDown({ dayIndex, rowIndex, rowData, allData })}>
                        <b>
                            Down
                        </b>
                    </div>
                </div>
            </div>
        </div>
    );
}

