from datetime import datetime
from pathlib import Path
import tempfile
import unittest

from openpyxl import Workbook, load_workbook

from scripts.export_audit_pack import write_rows


class WorkbookExportTests(unittest.TestCase):
    def setUp(self):
        directory = tempfile.TemporaryDirectory()
        self.addCleanup(directory.cleanup)
        self.path = Path(directory.name) / "audit.xlsx"
        workbook = Workbook()
        sheet = workbook.active
        sheet.title = "Audit"
        sheet.append(["Title", "Notes"])
        sheet.append(["old data"])
        workbook.create_sheet("Summary")["A1"] = "=1+1"
        workbook.save(self.path)
        workbook.close()

    def test_audit_strings_remain_literal_after_saving(self):
        values = ["=1+1", "#N/A", "원문 메모", "'quoted", "00123"]
        write_rows(self.path, "Audit", [values])
        workbook = load_workbook(self.path)
        self.addCleanup(workbook.close)
        cells = workbook["Audit"][2]
        self.assertEqual([cell.value for cell in cells], values)
        self.assertEqual([cell.data_type for cell in cells], ["s"] * len(values))
        self.assertEqual(workbook["Summary"]["A1"].data_type, "f")

    def test_native_cell_types_and_template_header_are_preserved(self):
        stamp = datetime(2026, 1, 2, 3, 4, 5)
        write_rows(self.path, "Audit", [[27, True, stamp, None, "end"]])
        workbook = load_workbook(self.path)
        self.addCleanup(workbook.close)
        sheet = workbook["Audit"]
        self.assertEqual(sheet["A1"].value, "Title")
        self.assertEqual([cell.value for cell in sheet[2]], [27, True, stamp, None, "end"])
        self.assertEqual([sheet[c].data_type for c in ("A2", "B2", "C2")], ["n", "b", "d"])
