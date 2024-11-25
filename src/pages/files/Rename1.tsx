import { Button } from "@/components/ui/button";
import React, { useState } from "react";

import { open, save } from "@tauri-apps/plugin-dialog";
import { readDir, rename, writeFile, copyFile } from "@tauri-apps/plugin-fs";
import {
  fileOpen,
  directoryOpen,
  fileSave,
  supported,
} from "browser-fs-access";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { exportToExcel } from "@/lib/exportToExcel";
import { toast } from "sonner"

export type FileList = {
  _id: string;
  id: number;
  name: string;
  originName: string;
};

export const columns: ColumnDef<FileList>[] = [
  // {
  //   id: "select",
  //   header: ({ table }) => (
  //     <Checkbox
  //       checked={
  //         table.getIsAllPageRowsSelected() ||
  //         (table.getIsSomePageRowsSelected() && "indeterminate")
  //       }
  //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //       aria-label="Select all"
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //       aria-label="Select row"
  //     />
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  {
    accessorKey: "_id",
    header: "序号",
    cell: ({ row }) => (
      <div className="capitalize">{Number(row.getValue("_id"))}</div>
    ),
  },
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <div className="capitalize">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "name",
    header: "名称",
    cell: ({ row }) => <div className="capitalize">{row.getValue("name")}</div>,
  },
];

function BatchExtractID() {
  const [dirPath, setDirPath] = useState<string>("");
  const [fileList, setFileList] = useState<any[]>([]);

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data: fileList,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    // getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const handleFolderSelect = async () => {
    const dirPath = await open({
      multiple: false,
      directory: true,
    });
    toast.loading("正在读取文件夹...")
    setDirPath(dirPath as string);
    await readFileList(dirPath as string);
    toast.dismiss()
  };

  const readFileList = async (dirPath: string) => {
    // 读取文件夹下所有文件名
    const entries = await readDir(dirPath as string);
    console.log(2222, entries);
    const files = entries
      .filter((entry) => entry.isFile)
      .map((entry, index) => ({
        name: entry.name,
        originName: entry.name,
        id: entry.name.match(/(\d{5,20})-/)?.[1] as string,
      }))
      .sort((a, b) => Number(a.id) - Number(b.id))
      .map((file, index) => ({
        ...file,
        _id: index + 1,
      }));

    setFileList(files);
  };

  const handleAddSerialNumber = () => {
    const toastId = toast.loading("正在添加序号...")
    // // 实现添加序号的逻辑
    // const numberedFiles = fileList.map((file, index) => `${index + 1}.${file}`);
    // setFileList(numberedFiles);
    setTimeout(() => {
      const pArr = fileList.map((file) => {
        return rename(
          `${dirPath}/${file.name}`,
          `${dirPath}/${file._id}-${file.name}`
        ).then(() => {
          file.name = `${file._id}-${file.name}`;
        });
      });
      Promise.all(pArr).then(() => {
        console.log("rename success");
        // readFileList(dirPath)
        setFileList([...fileList]);
        toast.dismiss(toastId)
        toast.success("添加序号成功")
      }).catch(error => {
        toast.dismiss(toastId)
        toast.error(`添加序号失败:${error?.message || error}`)
      });
    }, 100)
  };

  const handleAddSerialNumberCopy = async () => {
    const _dirPath = await open({
      multiple: false,
      directory: true,
    });
    if(!_dirPath) return
    const toastId = toast.loading("正在添加序号...")
    setTimeout(() => {
      const pArr = fileList.map((file) => {
        return copyFile(
          `${dirPath}/${file.name}`,
          `${_dirPath}/${file._id}-${file.name}`
        ).then(() => {
          file.name = `${file._id}-${file.name}`;
        });
      });
      Promise.all(pArr).then(() => {
        console.log("rename success");
        // readFileList(dirPath)
        setFileList([...fileList]);
        toast.dismiss(toastId)
        toast.success("添加序号并复制成功")
      }).catch(error => {
        toast.dismiss(toastId)
        toast.error(`添加序号并复制失败:${error?.message || error}`)
      });
    }, 100)
  }

  const handleExtractID = async () => {
    try {
      const result = await save({
        filters: [
          {
            name: "Excel Files",
            extensions: ["xlsx"],
          },
        ],
      });
      
      if (!result) {
        console.log("用户取消了文件保存");
        return;
      }
      toast.loading("正在导出ID...")
      // 实现提取 ID 并保存到 Excel 的逻辑
      // 这可能需要使用相关的 Excel 处理库
      const blob = await exportToExcel(fileList.map(file => ({id: file.id, serial: file._id, name: file.name})));

      // 将Blob数据写入文件
      const buffer = await blob.arrayBuffer();

      await writeFile(result, new Uint8Array(buffer));

      console.log(`文件已保存到: ${result}`);
      toast.dismiss()
      toast.success("导出ID成功")
    } catch (error) {
      console.error("保存文件时发生错误:", error);
    }
  };

  return (
    <div className="py-4">
      <div className="w-full">
        <div className="flex items-center py-4 gap-4 sticky top-0 z-[99]">
          <Button className="" onClick={handleFolderSelect}>
            选择文件夹
          </Button>
          <Button onClick={handleAddSerialNumber}>添加序号(覆盖)</Button>
          <Button onClick={handleAddSerialNumberCopy}>添加序号(复制)</Button>
          <Button onClick={handleExtractID}>导出ID</Button>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

export default BatchExtractID;

export const Component: any = BatchExtractID;
Component.displayName = "BatchExtractID";
