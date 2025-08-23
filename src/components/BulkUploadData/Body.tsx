import React, { useState } from "react";
import { usePapaParse } from "react-papaparse";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/retroui/Card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { retroStyle } from "@/lib/styles";
import { Select } from "@/components/retroui/Select";
import {
  databases,
  DATABASE_ID,
  STUDENTS_COLLECTION_ID,
  ID,
} from "@/lib/appwrite";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const BulkUploadPageBody = () => {
  const { readString } = usePapaParse();
  const [csvData, setCSVData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [columnMapping, setColumnMapping] = useState<{ [key: string]: string }>(
    {
      name: "",
      email: "",
      roll: "",
      food_preference: "",
      payment_method: "",
      section: "",
    }
  );
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [processedData, setProcessedData] = useState<any[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        readString(e.target?.result as string, {
          header: true,
          complete: (results) => {
            setCSVData(results.data);
            setHeaders(Object.keys(results.data[0] as object));
          },
        });
      };
      reader.readAsText(file);
    }
  };

  const handleMappingChange = (field: string, value: string) => {
    setColumnMapping((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateRecord = (record: any) => {
    const mappedRecord = {
      name: record[columnMapping.name]?.trim(),
      email: record[columnMapping.email]?.trim(),
      roll: record[columnMapping.roll]?.trim(),
      food_preference: record[columnMapping.food_preference]
        ?.trim()
        .toLowerCase(),
      payment_method: normalizePaymentMethod(
        record[columnMapping.payment_method]
      ),
      section: record[columnMapping.section]?.trim() || null,
      year: selectedYear,
    };

    if (!mappedRecord.name || !mappedRecord.email || !mappedRecord.roll) {
      return null;
    }

    if (!["veg", "non-veg"].includes(mappedRecord.food_preference)) {
      mappedRecord.food_preference = "veg";
    }

    return mappedRecord;
  };

  const normalizePaymentMethod = (value: any): string | null => {
    if (!value) return null;

    const normalized = value.toString().trim().toLowerCase();

    if (normalized === "") return null;
    if (normalized === "null") return null;
    if (normalized === "undefined") return null;

    if (normalized.includes("online")) return "online";
    if (normalized.includes("offline")) return "offline";

    return null;
  };

  const processDataForPreview = () => {
    if (
      !selectedYear ||
      !columnMapping.name ||
      !columnMapping.email ||
      !columnMapping.roll
    ) {
      alert("Please select year and map required fields (name, email, roll)");
      return;
    }

    const processed = csvData
      .map((record) => validateRecord(record))
      .filter(Boolean);
    setProcessedData(processed);
    setShowPreview(true);
  };

  const handleUpload = async () => {
    setUploading(true);
    let successful = 0;
    let failed = 0;

    for (let i = 0; i < processedData.length; i++) {
      try {
        await databases.createDocument(
          DATABASE_ID,
          STUDENTS_COLLECTION_ID,
          ID.unique(),
          processedData[i]
        );
        successful++;
      } catch (error) {
        console.error("Error uploading record:", error);
        failed++;
      }

      setUploadProgress(Math.round(((i + 1) / processedData.length) * 100));
    }

    setUploading(false);
    alert(`Upload complete!\nSuccessful: ${successful}\nFailed: ${failed}`);
    setShowPreview(false);
  };

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <Card.Header>
          <Card.Title>Bulk Upload Students</Card.Title>
          <Card.Description>
            Upload multiple student records using a CSV file
          </Card.Description>
        </Card.Header>
        <div className="space-y-4 p-6">
          <div>
            <Label>Select Year</Label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <Select.Trigger className={retroStyle}>
                <Select.Value placeholder="Select year" />
              </Select.Trigger>
              <Select.Content>
                <Select.Group>
                  <Select.Item value="1">1st Year</Select.Item>
                  <Select.Item value="2">2nd Year</Select.Item>
                  <Select.Item value="3">3rd Year</Select.Item>
                  <Select.Item value="4">4th Year</Select.Item>
                </Select.Group>
              </Select.Content>
            </Select>
          </div>

          <div>
            <Label>Upload CSV File</Label>
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className={retroStyle}
            />
          </div>

          {headers.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl">Map Columns</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name (required)</Label>
                  <Select
                    value={columnMapping.name}
                    onValueChange={(v) => handleMappingChange("name", v)}
                  >
                    <Select.Trigger className={retroStyle}>
                      <Select.Value placeholder="Select column" />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Group>
                        {headers.map((header) => (
                          <Select.Item key={header} value={header}>
                            {header}
                          </Select.Item>
                        ))}
                      </Select.Group>
                    </Select.Content>
                  </Select>
                </div>

                <div>
                  <Label>Email (required)</Label>
                  <Select
                    value={columnMapping.email}
                    onValueChange={(v) => handleMappingChange("email", v)}
                  >
                    <Select.Trigger className={retroStyle}>
                      <Select.Value placeholder="Select column" />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Group>
                        {headers.map((header) => (
                          <Select.Item key={header} value={header}>
                            {header}
                          </Select.Item>
                        ))}
                      </Select.Group>
                    </Select.Content>
                  </Select>
                </div>

                <div>
                  <Label>Roll No. (required)</Label>
                  <Select
                    value={columnMapping.roll}
                    onValueChange={(v) => handleMappingChange("roll", v)}
                  >
                    <Select.Trigger className={retroStyle}>
                      <Select.Value placeholder="Select column" />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Group>
                        {headers.map((header) => (
                          <Select.Item key={header} value={header}>
                            {header}
                          </Select.Item>
                        ))}
                      </Select.Group>
                    </Select.Content>
                  </Select>
                </div>

                <div>
                  <Label>Food Preference (required)</Label>
                  <Select
                    value={columnMapping.food_preference}
                    onValueChange={(v) =>
                      handleMappingChange("food_preference", v)
                    }
                  >
                    <Select.Trigger className={retroStyle}>
                      <Select.Value placeholder="Select column" />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Group>
                        {headers.map((header) => (
                          <Select.Item key={header} value={header}>
                            {header}
                          </Select.Item>
                        ))}
                      </Select.Group>
                    </Select.Content>
                  </Select>
                </div>

                <div>
                  <Label>Payment Method (optional)</Label>
                  <Select
                    value={columnMapping.payment_method}
                    onValueChange={(v) =>
                      handleMappingChange("payment_method", v)
                    }
                  >
                    <Select.Trigger className={retroStyle}>
                      <Select.Value placeholder="Select column" />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Group>
                        {headers.map((header) => (
                          <Select.Item key={header} value={header}>
                            {header}
                          </Select.Item>
                        ))}
                      </Select.Group>
                    </Select.Content>
                  </Select>
                </div>

                <div>
                  <Label>Section (optional)</Label>
                  <Select
                    value={columnMapping.section}
                    onValueChange={(v) => handleMappingChange("section", v)}
                  >
                    <Select.Trigger className={retroStyle}>
                      <Select.Value placeholder="Select column" />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Group>
                        {headers.map((header) => (
                          <Select.Item key={header} value={header}>
                            {header}
                          </Select.Item>
                        ))}
                      </Select.Group>
                    </Select.Content>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={processDataForPreview}
                  disabled={uploading}
                  className={`${retroStyle} bg-blue-400 hover:bg-blue-500`}
                >
                  Preview Data
                </Button>

                {showPreview && (
                  <Button
                    onClick={handleUpload}
                    disabled={uploading}
                    className={`${retroStyle} bg-yellow-400 hover:bg-yellow-500`}
                  >
                    {uploading
                      ? `Uploading... ${uploadProgress}%`
                      : "Confirm Upload"}
                  </Button>
                )}
              </div>

              {showPreview && (
                <div className="mt-4">
                  <h3 className="text-xl mb-2">Data Preview</h3>
                  <div className="border rounded-lg overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>#</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Roll</TableHead>
                          <TableHead>Food Preference</TableHead>
                          <TableHead>Payment Method</TableHead>
                          <TableHead>Section</TableHead>
                          <TableHead>Year</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {processedData.map((record, index) => (
                          <TableRow key={index}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{record.name}</TableCell>
                            <TableCell>{record.email}</TableCell>
                            <TableCell>{record.roll}</TableCell>
                            <TableCell>{record.food_preference}</TableCell>
                            <TableCell>{record.payment_method}</TableCell>
                            <TableCell>{record.section}</TableCell>
                            <TableCell>{record.year}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default BulkUploadPageBody;
