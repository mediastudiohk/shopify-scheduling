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

const CutOffComponents = () => {
  const [cutoffTime, setCutoffTime] = useState("");
  const [dayDifference, setDayDifference] = useState(null);
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
      const response = await fetch(CUTOFF_TIME_URL);
      const data = await response.json();
      setCutoffTime(data.response?.cutoff_time);
      setDayDifference(data.response?.day_difference);
      setIsLoading(false);
    } catch (error) {
      console.log("Error:", error);
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (Number(dayDifference) === 0 && cutoffTime === "") {
      setIsErrorCutoffTime({
        isError: true,
        message: "This field is required!",
      });
    } else if (
      Number(dayDifference) === 0 &&
      !REGEX_CUTOFF_TIME.test(cutoffTime)
    ) {
      setIsErrorCutoffTime({
        isError: true,
        message: "Cutoff time invalid!",
      });
    } else {
      const jsonBody = {
        cutoffTime: cutoffTime,
        dayDifference: Number(dayDifference),
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
    if (value > 0) {
      setIsErrorCutoffTime(IS_ERROR_DEFAULT);
    }
    if (value <= 99) {
      setDayDifference(value);
    }
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
              type="number"
              label="Day difference"
              placeholder="Enter day difference"
              value={dayDifference}
              onChange={handleChangeDayDifference}
              autoComplete="off"
              min="0"
              max="99"
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
