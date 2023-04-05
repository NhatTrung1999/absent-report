import {
  TableContainer,
  Table,
  TableHead,
  TableCell,
  TableBody,
  TableRow,
  Paper,
  Button,
} from "@mui/material";
import { format } from "date-fns";
import swal from "sweetalert";
import axios from "axios";
import { useState, useEffect } from "react";

const columns = [
  { id: 0, label: "Loại phép", minWidth: 170 },
  { id: 1, label: "Ngày bắt đầu", minWidth: 170 },
  { id: 2, label: "Ngày kết thúc", minWidth: 170 },
  { id: 3, label: "Trạng thái", minWidth: 170 },
  { id: 4, label: "", minWidth: 50 },
];

function ListRegister({ open, showId }) {
  const [showTypeVacation, setShowTypeVacation] = useState([]);
  const [cancelId, setCancelId] = useState(null);

  useEffect(() => {
    axios
      .get(
        "http://www.lacty.com.vn/Report_Vacation/data/data_report_vacation.php?action=showData&showId=" +
          showId
      )
      .then((res) => {
        const array = [];
        for (let item in res.data) {
          array.push(res.data[item]);
        }
        // console.log(res.data);
        setShowTypeVacation(array);
      })
      .catch(function (error) {
        console.log(error);
      });
  }, [open, cancelId]);

  const ConfirmCancel = (serialNo) => {
    swal({
      title: "Bạn có chắc chắn?",
      text: "Muốn hủy phiếu đăng ký nghỉ phép này!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        const payload = {
          cancelId: serialNo,
        };
        axios
          .post(
            "http://www.lacty.com.vn/Report_Vacation/data/data_report_vacation.php?action=saveVacation",
            JSON.stringify(payload)
          )
          .then((res) => {
            if (res.data.status === true) {
              swal("Bạn đã hủy phiếu đăng ký nghỉ phép này!", {
                icon: "success",
              });
              setCancelId(serialNo);
            } else {
              swal("Error Data", { icon: "error" });
            }
          })
          .catch((err) => console.log(err));
      }
    });
  };

  const format_time = (time) => {
    const dateParts = time.split(/[/: ]/); // tách chuỗi thành mảng các phần tử

    const year = dateParts[0];
    const month = dateParts[1].padStart(2, "0");
    const day = dateParts[2].padStart(2, "0");
    const hours =
      dateParts[3] === "下午"
        ? parseInt(dateParts[4]) + 12
        : parseInt(dateParts[4]); // chuyển đổi sang giờ 24h
    const minutes = dateParts[5].padStart(2, "0");
    const seconds = dateParts[6].padStart(2, "0");

    const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    return formattedDateTime;
  };

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align="center"
                  style={{ minWidth: column.minWidth, fontWeight: "600" }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {showTypeVacation.map((row, index) => {
              let action = false;
              const checkStatus = (status) => {
                switch (status) {
                  case "0": {
                    action = true;
                    status = "Đang ký";
                    return (
                      <Button color="info" style={{ fontWeight: "bold" }}>
                        {status}
                      </Button>
                    );
                  }
                  case "1": {
                    action = true;
                    status = "Đã ký";
                    return (
                      <Button color="success" style={{ fontWeight: "bold" }}>
                        {status}
                      </Button>
                    );
                  }
                  case "2": {
                    action = false;
                    status = "Đang hủy";
                    return (
                      <Button color="warning" style={{ fontWeight: "bold" }}>
                        {status}
                      </Button>
                    );
                  }
                  case "3": {
                    action = false;
                    status = "Đã Hủy";
                    return (
                      <Button color="error" style={{ fontWeight: "bold" }}>
                        {status}
                      </Button>
                    );
                  }
                  default: {
                    status = "Chờ ký";
                    return (
                      <Button color="info" style={{ fontWeight: "bold" }}>
                        {status}
                      </Button>
                    );
                  }
                }
              };

              return (
                <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                  <TableCell align="center">{`${row["1"]}/${row["2"]}`}</TableCell>
                  <TableCell align="center">
                    {
                      format(new Date(format_time(row[3])), "yyyy-MM-dd HH:mm")
                        .toString()
                        .split(" ")[0]
                    }
                    {/* {
                      format(new Date(row[3]), "yyyy-MM-dd HH:mm")
                        .toString()
                        .split(" ")[0]
                    } */}
                    &nbsp;
                    <span style={{ fontWeight: "bold" }}>
                      {
                        format(
                          new Date(format_time(row[3])),
                          "yyyy-MM-dd HH:mm"
                        )
                          .toString()
                          .split(" ")[1]
                      }
                      {/* {
                        format(new Date(row[3]), "yyyy-MM-dd HH:mm")
                          .toString()
                          .split(" ")[1]
                      } */}
                    </span>
                  </TableCell>
                  <TableCell align="center">
                    {
                      format(new Date(format_time(row[4])), "yyyy-MM-dd HH:mm")
                        .toString()
                        .split(" ")[0]
                    }
                    {/* {
                      format(new Date(row[4]), "yyyy-MM-dd HH:mm")
                        .toString()
                        .split(" ")[0]
                    } */}
                    &nbsp;
                    <span style={{ fontWeight: "bold" }}>
                      {
                        format(
                          new Date(format_time(row[4])),
                          "yyyy-MM-dd HH:mm"
                        )
                          .toString()
                          .split(" ")[1]
                      }
                      {/* {
                        format(new Date(row[4]), "yyyy-MM-dd HH:mm")
                          .toString()
                          .split(" ")[1]
                      } */}
                    </span>
                  </TableCell>

                  <TableCell align="center">{checkStatus(row["5"])}</TableCell>
                  <TableCell align="center">
                    {action && (
                      <Button
                        variant="contained"
                        size="medium"
                        color="error"
                        onClick={() => ConfirmCancel(row["6"])}
                      >
                        Hủy
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default ListRegister;
