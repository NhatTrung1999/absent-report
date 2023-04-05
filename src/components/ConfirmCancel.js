import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

export default function ConfirmCancel({ open, cancelId, handleCloseCancel }) {
  const handleSave = () => {
    const payload = {
      cancelId: cancelId,
    };
    axios
      .post(
        "http://192.168.18.2:8088/Report_Vacation/data/data_report_vacation.php?action=saveVacation",
        JSON.stringify(payload)
      )
      .then((res) => {
        console.log(res.data.status);
      })
      .catch((err) => console.log(err));
    handleCloseCancel();
  };

  return (
    <Dialog
      open={open}
      onClose={handleCloseCancel}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {"Bạn chắc chắn có muốn hủy trạng thái này không?"}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Nhấn vào nút bên dưới để thay đổi trạng thái
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseCancel}>Hủy</Button>
        <Button onClick={handleSave} autoFocus>
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  );
}
