import React, { useEffect, useState } from "react";
import { Toast } from "@shopify/app-bridge-react";
import { TextField } from "@shopify/polaris";
import { styles } from "../../styles";
import { DOMAIN, REGEX_CUTOFF_TIME } from "../../constants/constants";
import { LoadingDot } from "../loading-dot";

const CUTOFF_TIME_URL = `${DOMAIN}/api/rule-order`;
const IS_ERROR_DEFAULT = {
  isError: false,
  message: "",
};
const CUTOFF_TIME_DEFAULT = "00:00";
const DAY_DIFFERENCE_DEFAULT = "0";

const CutOffComponents = () => {
  const [cutoffTime, setCutoffTime] = useState("");
  const [dayDifference, setDayDifference] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isErrorCutoffTime, setIsErrorCutoffTime] = useState(IS_ERROR_DEFAULT);

  const emptyToastProps = { content: null };
  const [toastProps, setToastProps] = useState(emptyToastProps);
  const toastMarkup = toastProps.content && (
    <Toast {...toastProps} onDismiss={() => setToastProps(emptyToastProps)} />
  );
  useEffect(() => {
    const fetchData = async () => {
      await getCutOffByDomain();
    };
    fetchData();
  }, []);

  const getCutOffByDomain = async () => {
    try {
      setIsLoading(true);
      setIsErrorCutoffTime(IS_ERROR_DEFAULT);
      const res = await fetch(CUTOFF_TIME_URL);
      const data = await res.json();
      const { response } = data;
      setCutoffTime(String(response?.cutoff_time));
      setDayDifference(String(response?.day_difference));
      setIsLoading(false);
    } catch (error) {
      console.log("Error:", error);
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!dayDifference) setDayDifference(DAY_DIFFERENCE_DEFAULT);
    if (!cutoffTime) setCutoffTime(CUTOFF_TIME_DEFAULT);

    if (cutoffTime && !REGEX_CUTOFF_TIME.test(cutoffTime)) {
      setIsErrorCutoffTime({
        isError: true,
        message: "Cutoff time invalid!",
      });
      return;
    }

    const jsonBody = {
      cutoffTime: !cutoffTime ? CUTOFF_TIME_DEFAULT : cutoffTime,
      dayDifference: !dayDifference
        ? Number(DAY_DIFFERENCE_DEFAULT)
        : Number(dayDifference),
    };
    try {
      setIsLoading(true);
      let response = await fetch(CUTOFF_TIME_URL, {
        method: "PATCH",
        body: JSON.stringify(jsonBody),
        headers: {
          "content-type": "application/json",
        },
      });
      if (response.status === 200) {
        setToastProps({ content: "Save Cutoff time Successfully!" });
        await getCutOffByDomain();
        setIsLoading(false);
      }
    } catch (error) {
      console.log("Error:", error);
      setIsLoading(false);
      setToastProps({
        content: "Some thing went wrong!",
      });
    }
  };

  const formatTime = (inputTime) => {
    if (inputTime === "") {
      // Allow an empty input field
      return "";
    } else if (REGEX_CUTOFF_TIME.test(inputTime)) {
      return inputTime;
    } else {
      // If the input doesn't match the format, attempt to format partial input
      const numbersOnly = inputTime.replace(/[^\d]/g, "");
      if (numbersOnly.length <= 4) {
        const hours = numbersOnly.slice(0, 2);
        const minutes = numbersOnly.slice(2);
        if (minutes === "") return `${hours}`;
        return `${hours}:${minutes}`;
      } else {
        // If input is invalid, return the previous time value
        return cutoffTime;
      }
    }
  };

  const handleChangeCutoffTime = (value) => {
    setIsErrorCutoffTime(IS_ERROR_DEFAULT);
    const formattedTime = formatTime(value);
    setCutoffTime(formattedTime);
  };

  const handleChangeDayDifference = (value) => {
    if (value) {
      setIsErrorCutoffTime(IS_ERROR_DEFAULT);
    }
    const numericValue = value.replace(/\D/g, "");
    setDayDifference(numericValue);
  };

  return (
    <div>
      {isLoading ? (
        <div
          style={{
            ...styles.loadingContainer,
            height: "auto",
          }}
        >
          <LoadingDot />
        </div>
      ) : (
        <>
          {toastMarkup}

          <div className="col" style={{ marginBottom: 12, width: "20%" }}>
            <TextField
              error={
                isErrorCutoffTime.isError ? isErrorCutoffTime.message : false
              }
              type="text"
              label="Cutoff time"
              placeholder="Enter cutoff time hh:mm"
              value={cutoffTime}
              maxLength="5"
              onChange={handleChangeCutoffTime}
              autoComplete="off"
            />
          </div>
          <div className="col" style={{ width: "20%" }}>
            <TextField
              type="text"
              label="Day difference"
              placeholder="Enter day difference"
              value={dayDifference}
              onChange={handleChangeDayDifference}
              autoComplete="off"
              maxLength="2"
            />
          </div>
          <div
            style={{
              ...styles.buttonSaveContainer,
              marginLeft: 0,
            }}
            onClick={handleSave}
          >
            <b>Save</b>
          </div>
        </>
      )}
    </div>
  );
};

export default CutOffComponents;
