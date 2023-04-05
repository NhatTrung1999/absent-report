import {
  Box,
  Card,
  Container,
  CssBaseline,
  Grid,
  TextField,
  Typography,
  MenuItem,
  Button,
  Alert,
  AlertTitle,
} from "@mui/material";

import {
  LocalizationProvider,
  DatePicker,
  TimePicker,
} from "@mui/x-date-pickers";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useFormik } from "formik";
import { useState, useEffect } from "react";
import * as Yup from "yup";
import axios from "axios";
import { format } from "date-fns";
import jwtDecode from "jwt-decode";
import { useLocation } from "react-router-dom";
import moment from "moment";

const validationSchema = Yup.object({
  ID: Yup.string().required("Vui lòng nhập số thẻ của bạn!"),
  Date: Yup.string().required("Vui lòng nhập vào số ngày cần nghỉ!"),
  Hour: Yup.string().required("Vui lòng nhập vào số giờ cần nghỉ!"),
  Type: Yup.string().required("Vui lòng chọn loại phép cần nghỉ!"),
  DateTo: Yup.string().required("Vui lòng không để trống!"),
  DateEnd: Yup.string().required("Vui lòng không để trống!"),
  TimeTo: Yup.string().required("Vui lòng không để trống!"),
  TimeEnd: Yup.string().required("Vui lòng không để trống!"),
});

const validate = (values) => {
  const error = {};
  const { DateTo, DateEnd, TimeTo, TimeEnd } = values;

  if (DateTo.$d > DateEnd.$d) {
    error.DateEnd = "Ngày kết thúc không được nhỏ hơn ngày bắt đầu.";
  }
  if (TimeTo.$d > TimeEnd.$d) {
    error.TimeEnd = "Thời gian kết thúc không được nhỏ hơn thời gian bắt đầu!";
  }

  if (
    moment(TimeTo.$d, "HH:mm") < moment("07:30", "HH:mm") ||
    moment(TimeTo.$d, "HH:mm") > moment("16:31", "HH:mm")
  ) {
    error.TimeTo = "Vui lòng chọn trong khung giờ từ 7:30 đến 16:30";
  }

  if (
    moment(TimeEnd.$d, "HH:mm") < moment("7:30", "HH:mm") ||
    moment(TimeEnd.$d, "HH:mm") > moment("16:31", "HH:mm")
  ) {
    error.TimeEnd = "Vui lòng chọn trong khung giờ từ 7:30 đến 16:30";
  }

  return error;
};

function App() {
  const [status, setStatus] = useState(false);
  const [typeVacation, setTypeVacation] = useState([]);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const paramsKey = searchParams.get("key");
  const decoded = jwtDecode("t." + paramsKey + ".t");

  // "http://www.lacty.com.vn/Report_Vacation/data/data_report_vacation.php?action=typeVacation"
  //"http://192.168.18.2:8088/Report_Vacation/data/data_report_vacation.php?action=typeVacation"

  useEffect(() => {
    axios
      .get(
        "http://192.168.18.2:8088/Report_Vacation/data/data_report_vacation.php?action=typeVacation"
      )
      .then((res) => {
        const array = [];
        for (let item in res.data) {
          array.push(res.data[item]);
        }
        // console.log(res.data);
        setTypeVacation(array);
      })
      .catch(function (error) {
        console.log(error);
      });
  }, []);

  const formik = useFormik({
    initialValues: {
      ID: decoded.personId,
      fullName: decoded.fullName,
      Dep: decoded.department,
      Person_Serial_Key: decoded.personSerialKey,
      Department_Serial_Key: decoded.departmentKey,
      Date: 1,
      Hour: 0,
      Type: "",
      Reason: "",
      Remark: "",
      // Checked: false,
      DateTo: dayjs(),
      DateEnd: dayjs(),
      TimeTo: dayjs().set("hour", 7).set("minute", 30).set("second", 0),
      TimeEnd: dayjs().set("hour", 16).set("minute", 30).set("second", 0),
    },
    validationSchema,
    validate,
    onSubmit: async (values) => {
      console.log(values);

      let payload = {
        ID: values.ID,
        Person_Serial_Key: values.Person_Serial_Key,
        Department_Serial_Key: values.Department_Serial_Key,
        Date: values.Date,
        Hour: values.Hour,
        Type: values.Type,
        Reason: values.Reason,
        Remark: values.Remark,
        // Checked: values.Checked,
        DateTo: format(values.DateTo.$d, "yyyy-MM-dd"),
        DateEnd: format(values.DateEnd.$d, "yyyy-MM-dd"),
        TimeTo: format(values.TimeTo.$d, "HH:mm:ss"),
        TimeEnd: format(values.TimeEnd.$d, "HH:mm:ss"),
      };

      axios
        .post(
          "http://192.168.18.2:8088/Report_Vacation/data/data_report_vacation.php?action=addReportVacation",
          JSON.stringify(payload)
        )
        .then((res) => {
          console.log(res.data);
          if (res.data.status === true) {
            setStatus(true);
          } else {
            setStatus(false);
          }
        })
        .catch((err) => console.log(err));
    },
  });

  // thời gian bắt đầu và kết thúc
  const timeFormat = "HH:mm";
  let totalWorkTime = 0;
  let workTime = 0;
  let lunchTime = 0;

  let startTime = moment(format(formik.values.TimeTo.$d, "HH:mm"), timeFormat);

  let endTime = moment(format(formik.values.TimeEnd.$d, "HH:mm"), timeFormat);

  const lunchStart = moment("11:30", "h:mm");
  const lunchEnd = moment("12:30", "h:mm");

  lunchTime = moment.duration(lunchEnd.diff(lunchStart));

  if (
    startTime < lunchStart &&
    startTime < lunchEnd &&
    endTime < lunchStart &&
    endTime < lunchEnd
  ) {
    totalWorkTime = moment.duration(endTime.diff(startTime));
  } else if (startTime >= lunchStart && startTime <= lunchEnd) {
    totalWorkTime = moment.duration(endTime.diff(lunchEnd));
  } else if (startTime >= lunchStart && startTime >= lunchEnd) {
    totalWorkTime = moment.duration(endTime.diff(startTime));
  } else if (endTime >= lunchStart && endTime <= lunchEnd) {
    totalWorkTime = moment.duration(lunchStart.diff(startTime));
  } else {
    workTime = moment.duration(endTime.diff(startTime));
    totalWorkTime = moment.duration(workTime.subtract(lunchTime));
  }

  const workingTime = totalWorkTime.hours() * 1 + totalWorkTime.minutes() / 60;

  // Ngày bắt đầu và kết thúc
  const dateFormat = "YYYY-MM-DD";

  const startDate = moment(
    format(formik.values.DateTo.$d, "yyyy-MM-dd"),
    dateFormat
  );
  const endDate = moment(
    format(formik.values.DateEnd.$d, "yyyy-MM-dd"),
    dateFormat
  );

  // Tính số ngày làm việc
  let workingDays = 0;
  let currentDate = startDate;
  let holidays = 0;
  let checkSunday = "";

  let calculateSunday = typeVacation.filter(
    (type) => type["1"] === formik.values.Type
  );

  for (let i = 0; i < calculateSunday.length; i++) {
    if (calculateSunday[i] === undefined) {
      continue;
    }
    checkSunday = calculateSunday[i]["4"];
  }

  while (currentDate.isSameOrBefore(endDate)) {
    if (currentDate.day() !== 0) {
      workingDays++;
    }
    if (currentDate.day() === 0 && checkSunday === "1") {
      holidays++;
    }
    currentDate.add(1, "day");
  }

  if (workingTime >= 8) {
    formik.values.Date = workingDays + holidays;
    formik.values.Hour = 0;
  } else {
    formik.values.Date = workingDays - 1 + holidays;
    formik.values.Hour = workingTime.toFixed(2);
  }

  return (
    <>
      <CssBaseline />
      <Container>
        <Typography
          variant="h3"
          component="h1"
          align="center"
          color="#1976d2"
          marginTop={2}
          marginBottom={2}
          fontWeight={700}
        >
          PHIẾU NGHỈ PHÉP
        </Typography>

        {status === false ? (
          <Card variant="outlined" sx={{ marginBottom: 3 }}>
            <Box sx={{ p: 2 }} component="form">
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Số thẻ người xin nghỉ"
                    name="ID"
                    value={formik.values.ID}
                    onChange={formik.handleChange}
                    error={formik.touched.ID && Boolean(formik.errors.ID)}
                    helperText={formik.touched.ID && formik.errors.ID}
                    inputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Họ và tên người xin nghỉ"
                    inputProps={{
                      style: { textTransform: "uppercase" },
                      readOnly: true,
                    }}
                    value={formik.values.fullName}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Đơn vị"
                    inputProps={{
                      style: { textTransform: "uppercase" },
                      readOnly: true,
                    }}
                    value={formik.values.Dep}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    select
                    label="Loại phép đề nghị"
                    fullWidth
                    name="Type"
                    value={formik.values.Type}
                    onChange={(e) =>
                      formik.setFieldValue("Type", e.target.value)
                    }
                    error={formik.touched.Type && Boolean(formik.errors.Type)}
                    helperText={formik.touched.Type && formik.errors.Type}
                  >
                    {typeVacation.map((option) => (
                      <MenuItem
                        key={option["1"]}
                        value={option["1"]}
                        selected={formik.values.Type === option["1"]}
                      >
                        {option["2"]}/{option["3"]}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={9}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          format="DD-MM-YYYY"
                          sx={{ width: "100%" }}
                          label="Ngày bắt đầu xin nghỉ phép"
                          name="DateTo"
                          value={formik.values.DateTo}
                          onChange={(newDateTo) =>
                            formik.setFieldValue("DateTo", newDateTo)
                          }
                          slotProps={{
                            textField: {
                              helperText:
                                formik.touched.DateTo && formik.errors.DateTo,
                              error:
                                formik.touched.DateTo &&
                                Boolean(formik.errors.DateTo),
                            },
                          }}
                        />
                      </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          format="DD-MM-YYYY"
                          sx={{ width: "100%" }}
                          label="Ngày kết thúc xin nghỉ phép"
                          name="DateEnd"
                          value={formik.values.DateEnd}
                          onChange={(newDateFrom) =>
                            formik.setFieldValue("DateEnd", newDateFrom)
                          }
                          slotProps={{
                            textField: {
                              helperText:
                                formik.touched.DateEnd && formik.errors.DateEnd,
                              error:
                                formik.touched.DateEnd &&
                                Boolean(formik.errors.DateEnd),
                            },
                          }}
                        />
                      </LocalizationProvider>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12} md={6}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <TimePicker
                      format="HH:mm"
                      sx={{ width: "100%" }}
                      label="Thời gian bắt đầu xin nghỉ phép"
                      name="TimeTo"
                      value={formik.values.TimeTo}
                      onChange={(newTimeTo) =>
                        formik.setFieldValue("TimeTo", newTimeTo)
                      }
                      slotProps={{
                        textField: {
                          helperText:
                            formik.touched.TimeTo && formik.errors.TimeTo,
                          error:
                            formik.touched.TimeTo &&
                            Boolean(formik.errors.TimeTo),
                        },
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} md={6}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <TimePicker
                      format="HH:mm"
                      sx={{ width: "100%" }}
                      label="Thời gian kết thúc xin nghỉ phép"
                      name="TimeEnd"
                      value={formik.values.TimeEnd}
                      onChange={(newTimeEnd) =>
                        formik.setFieldValue("TimeEnd", newTimeEnd)
                      }
                      autoFocus={false}
                      slotProps={{
                        textField: {
                          helperText:
                            formik.touched.TimeEnd && formik.errors.TimeEnd,
                          error:
                            formik.touched.TimeEnd &&
                            Boolean(formik.errors.TimeEnd),
                        },
                      }}
                    />
                  </LocalizationProvider>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Ngày"
                    name="Date"
                    value={formik.values.Date}
                    onChange={formik.handleChange}
                    error={formik.touched.Date && Boolean(formik.errors.Date)}
                    helperText={formik.touched.Date && formik.errors.Date}
                    inputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Giờ"
                    name="Hour"
                    value={formik.values.Hour}
                    onChange={formik.handleChange}
                    error={formik.touched.Hour && Boolean(formik.errors.Hour)}
                    helperText={formik.touched.Hour && formik.errors.Hour}
                    inputProps={{ readOnly: true }}
                  />
                </Grid>

                {/* <Grid item xs={12} md={12}>
                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Checkbox
                            name="Checked"
                            checked={formik.values.Checked}
                            onChange={(e) =>
                              formik.setFieldValue("Checked", e.target.checked)
                            }
                          />
                        }
                        label="Hủy bỏ"
                      />
                    </FormGroup>
                  </Grid> */}

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Ghi rõ lý do"
                    name="Reason"
                    value={formik.values.Reason}
                    onChange={formik.handleChange}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Ghi chú"
                    name="Remark"
                    value={formik.values.Remark}
                    onChange={formik.handleChange}
                  />
                </Grid>

                <Grid item xs={12} md={12} display="none">
                  <TextField
                    fullWidth
                    label="Department_Serial_Key"
                    inputProps={{
                      style: { textTransform: "uppercase" },
                      readOnly: true,
                    }}
                    value={formik.values.Department_Serial_Key}
                  />
                </Grid>

                <Grid item xs={12} md={12} display="none">
                  <TextField
                    fullWidth
                    label="Person_Serial_Key"
                    inputProps={{
                      style: { textTransform: "uppercase" },
                      readOnly: true,
                    }}
                    value={formik.values.Person_Serial_Key}
                  />
                </Grid>

                <Grid item xs={12} md={12}>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={formik.handleSubmit}
                    type="submit"
                  >
                    Send
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Card>
        ) : (
          <div style={{ marginTop: "30px" }}>
            <Alert severity="success">
              <AlertTitle>
                <strong>Thành công</strong>
              </AlertTitle>
              Bạn đã đăng kí nghỉ phép thành công!
            </Alert>
          </div>
        )}
      </Container>
    </>
  );
}

export default App;
