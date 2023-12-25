'use client';

import React from 'react';
import { TableHead, TableRow, TableCell } from '@mui/material';

interface IScoresFlat {
  studentId: string;
  firstName: string;
  lastName: string;
  className: string;
  groupNumber: number;
  DOB: string;
  componentPoint: IComponentPoint[];
}

interface IComponentPoint {
  componentId: number;
  name: string;
  description: string;
}

const YourComponent: React.FC = () => {
  // Dữ liệu giả định
  const scoresFlatData: IScoresFlat[] = [
    {
      studentId: '1',
      firstName: 'John',
      lastName: 'Doe',
      className: 'Math',
      groupNumber: 1,
      DOB: '2000-01-01',
      componentPoint: [
        {
          componentId: 1,
          name: 'Component A',
          description: 'Description for Component A',
        },
        {
          componentId: 2,
          name: 'Component B',
          description: 'Description for Component B',
        },
      ],
    },
    // Thêm dữ liệu cho sinh viên khác nếu cần
  ];

  // Tạo danh sách các tiêu đề cho TableHead
  const tableHeaders: string[] = [
    'studentId',
    'firstName',
    'lastName',
    'className',
    'groupNumber',
  ];

  // Lấy tất cả các componentId để tạo tiêu đề từ chúng
  const componentIds: number[] = [];
  scoresFlatData.forEach((data) => {
    data.componentPoint.forEach((component) => {
      if (!componentIds.includes(component.componentId)) {
        componentIds.push(component.componentId);
      }
    });
  });

  // Thêm các componentId vào danh sách tiêu đề
  componentIds.forEach((componentId) => {
    tableHeaders.push(`name (of componentId ${componentId})`);
  });

  return (
    <TableHead>
      <TableRow>
        {/* Hiển thị các tiêu đề */}
        {tableHeaders.map((header, index) => (
          <TableCell key={index}>{header}</TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

export default YourComponent;
