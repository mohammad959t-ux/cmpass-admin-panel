import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Chip, Dialog, DialogTitle, DialogContent, IconButton
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

const Receipts = () => {
  const [receipts, setReceipts] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      const { data } = await axios.get("/api/receipts", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setReceipts(data);
    } catch (error) {
      console.error("Error fetching receipts:", error);
    }
  };

  const handleReview = async (id, action) => {
    try {
      await axios.put(
        `/api/receipts/${id}/review`,
        { action },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      fetchReceipts();
    } catch (error) {
      console.error("Error reviewing receipt:", error);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div>
      <h2>Receipts Management</h2>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User ID</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Currency</TableCell>
              <TableCell>Note</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>File</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {receipts.map((r) => (
              <TableRow key={r._id}>
                <TableCell>
                  {r.user?._id || "N/A"}
                  {r.user?._id && (
                    <IconButton
                      size="small"
                      onClick={() => copyToClipboard(r.user._id)}
                      style={{ marginLeft: "5px" }}
                    >
                      <ContentCopyIcon fontSize="inherit" />
                    </IconButton>
                  )}
                </TableCell>
                <TableCell>{r.user?.name || "N/A"}</TableCell>
                <TableCell>{r.amount}</TableCell>
                <TableCell>{r.currency}</TableCell>
                <TableCell>{r.note || "-"}</TableCell>
                <TableCell>
                  {r.status === "approved" ? (
                    <Chip label="Approved" color="success" />
                  ) : r.status === "rejected" ? (
                    <Chip label="Rejected" color="error" />
                  ) : (
                    <Chip label="Pending" color="warning" />
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setSelectedReceipt(r)}
                  >
                    View
                  </Button>
                </TableCell>
                <TableCell>
                  {r.status === "pending" && (
                    <>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => handleReview(r._id, "approved")}
                        style={{ marginRight: "8px" }}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => handleReview(r._id, "rejected")}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog لعرض الإيصال */}
      <Dialog open={!!selectedReceipt} onClose={() => setSelectedReceipt(null)} maxWidth="md" fullWidth>
        <DialogTitle>Receipt File</DialogTitle>
        <DialogContent>
          {selectedReceipt && (
            <img
              src={selectedReceipt.fileUrl}
              alt="receipt"
              style={{ width: "100%", height: "auto" }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Receipts;
