import React from "react";
import { Button, Input, Modal, Popover, Select, Space } from "antd";
import {
  FilterOutlined,
  SearchOutlined,
  SortAscendingOutlined,
} from "@ant-design/icons";
import { UserAction } from "../../../actions/userAction";
import {
  CreateNewUserInformation,
  UserDetailInformation,
} from "../../../types/userTypes";
import { BiEditAlt, BiPlus, BiTrashAlt } from "react-icons/bi";
import { BsFillArrowDownCircleFill } from "react-icons/bs";
import EmployeeSort from "./components/EmployeeSort";
import EmployeeFilter from "./components/EmployeeFilter";
import CreateNewEmployee from "./components/CreateNewEmployee";
import showNotification from "../../../utils/notification";
import { useRecoilState } from "recoil";
import { jobTitleState } from "../../../recoil/atoms/jobTitle";
import { departmentState } from "../../../recoil/atoms/department";
import { JobTitleAction } from "../../../actions/jobTitleAction";
import { DepartmentAction } from "../../../actions/departmentAction";
import { JobInformationAction } from "../../../actions/jobInformationAction";
import dayjs from "dayjs";
import EditEmployee from "./components/EditEmployee";

const titleTable = [
  "STT",
  "Họ và tên",
  "Giới tính",
  "Chức vụ",
  "Email",
  "Số điện thoại",
  "Chi nhánh",
  "Trình độ",
  "Trạng thái",
  "Thao tác",
];

const EmployeeManagement: React.FunctionComponent = () => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [employeeList, setEmployeeList] = React.useState<
    UserDetailInformation[]
  >([]);
  const [searchText, setSearchText] = React.useState<string>("");
  const [employeeSearched, setEmployeeSearched] = React.useState<
    UserDetailInformation[]
  >([]);

  const [employeeFiltered, setEmployeeFiltered] = React.useState<
    UserDetailInformation[]
  >([]);

  const [newEmployee, setNewEmployee] =
    React.useState<CreateNewUserInformation>({
      email: "",
      fullName: "",
      gender: "",
      status: "",
      roleId: "",
    });

  const [isOpenEditModal, setIsOpenEditModal] = React.useState<{
    isOpen: boolean;
    userInfo: UserDetailInformation;
  }>({ userInfo: {} as UserDetailInformation, isOpen: false });
  const [isOpenCreateModal, setIsOpenCreateModal] = React.useState(false);
  const [isModalDeleteOpen, setIsModalDeleteOpen] = React.useState(false);
  const [jobTitles, setJobTitles] = useRecoilState(jobTitleState);
  const [departments, setDepartments] = useRecoilState(departmentState);

  React.useEffect(() => {
    const fetchData = async () => {
      const employees = await UserAction.getAllEmployees();
      setJobTitles(await JobTitleAction.getAllJobTitles());
      setDepartments(await DepartmentAction.getAllDepartments());

      setEmployeeList(employees);
      setIsLoading(false);
    };

    fetchData();
  }, [setDepartments, setJobTitles]);

  const handleSearchEmployee = (value: string) => {
    if (value === "") {
      setEmployeeSearched([]);
      return;
    } else {
      const searchResult = employeeList.filter((employee) =>
        employee.fullName.toLowerCase().includes(value.toLowerCase())
      );

      if (!searchResult.length) {
        showNotification("error", "Không tìm thấy nhân viên");
      }

      setEmployeeSearched(searchResult);
    }
  };

  const handleFilterEmployee = (payload: {
    gender: string;
    jobTitle: string;
    department: string;
  }) => {
    const { gender, jobTitle, department } = payload;

    const filteredEmployees = employeeList.filter((employee) => {
      // Filter by gender
      if (gender !== "All") {
        return employee.gender === gender;
      }

      // Filter by job title
      if (jobTitle !== "All") {
        return employee.jobInformation?.jobTitle?.name === jobTitle;
      }

      // Filter by department
      if (department !== "All") {
        return employee.jobInformation?.department?.name === department;
      }

      return true;
    });

    setEmployeeFiltered(filteredEmployees);
  };

  const handleCreateNewEmployee = async () => {
    if (
      !newEmployee.email ||
      !newEmployee.fullName ||
      !newEmployee.gender ||
      !newEmployee.status ||
      newEmployee.roleId === ""
    ) {
      showNotification("error", "Vui lòng điền đầy đủ thông tin");
    } else {
      const response = await UserAction.createNewUser(newEmployee);

      if (response?.user.id) {
        await JobInformationAction.create({
          userId: response.user.id,
          joinDate: dayjs(new Date()).format("YYYY-MM-DD"),
          employeeStatus: newEmployee.status,
        });
      }

      window.location.reload();
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await UserAction.deleteUser(userId);
    } catch (err) {
      showNotification("error", "Xóa nhân viên không thành công");
    }
    setIsModalDeleteOpen(false);
    window.location.reload();
  };

  const resultEmployeeList = React.useMemo(() => {
    if (employeeSearched.length) {
      return employeeSearched;
    }

    if (employeeFiltered.length) {
      return employeeFiltered;
    }

    return employeeList;
  }, [employeeList, employeeSearched, employeeFiltered]);

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="flex w-full h-16 justify-center items-center border-b-[2px]">
        <div className="w-[99%] flex flex-row justify-between">
          <div className="flex flex-row">
            <Space direction="vertical" className="w-[100%] mr-1 flex flex-row">
              <Popover
                placement="bottomRight"
                content={
                  <EmployeeFilter
                    onApply={(payload) => handleFilterEmployee(payload)}
                  />
                }
                title={"Filter"}
                trigger={"click"}
              >
                <Button size="middle" icon={<FilterOutlined />}>
                  Lọc
                </Button>
              </Popover>
              <Popover
                placement="right"
                content={<EmployeeSort />}
                title={"Sort"}
                trigger={"click"}
              >
                <Button size="middle" icon={<SortAscendingOutlined />}>
                  Sắp xếp
                </Button>
              </Popover>
            </Space>
          </div>
          <div>
            <Space.Compact style={{ width: "100%" }}>
              <Input
                defaultValue={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearchEmployee(searchText);
                  }
                }}
                allowClear
              />
              <Button
                className="bg-blue-600 text-white"
                type="primary"
                icon={<SearchOutlined />}
                size="middle"
                onClick={() => {
                  handleSearchEmployee(searchText);
                }}
              >
                Search
              </Button>
            </Space.Compact>
          </div>
        </div>
      </div>
      <div className="w-full h-12 px-1 py-1 border-b flex flex-row justify-around">
        <div className="flex justify-between items-center w-full">
          <span className="ml-4">
            Tổng số nhân viên: <span>{employeeList.length}</span>
          </span>
          <div className="flex flex-row justify-around gap-2">
            <button
              className="w-28 h-8 bg-white text-blue-600 text-lg flex justify-center items-center rounded-md 
            hover:shadow-md border-[1px] border-blue-600"
            >
              <BsFillArrowDownCircleFill />
              <span className="ml-2 text-[16px]">Nhập file</span>
            </button>
            <button
              onClick={() => setIsOpenCreateModal(true)}
              className="w-24 h-8 bg-blue-600 text-white text-lg flex justify-center items-center border-[1px] rounded-md 
            hover:bg-white hover:text-blue-600 hover:border-blue-600"
            >
              <BiPlus />
              <span className="ml-2 text-[16px]">Tạo mới</span>
            </button>
            <Modal
              title="Tạo mới nhân viên"
              open={isOpenCreateModal}
              width={600}
              onCancel={() => setIsOpenCreateModal(false)}
              footer={[
                <Button
                  onClick={async () => {
                    await handleCreateNewEmployee();
                  }}
                  className="w-24 rounded-md h-8 bg-blue-500 text-white cursor-pointer"
                >
                  Tạo mới
                </Button>,
                <button
                  onClick={() => setIsOpenCreateModal(false)}
                  className="w-24 ml-2 rounded-md h-8 bg-red-500 text-white cursor-pointer"
                >
                  Hủy
                </button>,
              ]}
            >
              <CreateNewEmployee
                onChange={(value) => {
                  setNewEmployee({
                    email: value.email,
                    fullName: value.fullName,
                    gender: value.gender,
                    status: value.status,
                    roleId: value.roleId,
                  });
                }}
              />
            </Modal>
          </div>
        </div>
      </div>
      {isLoading ? (
        <div className="text-center">
          <div role="status">
            <svg
              aria-hidden="true"
              className="inline w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="w-full px-2 py-2 h-screen overflow-auto">
          <div>
            <div className="flex max-h-80 overflow-x-auto overflow-y-auto scrollbar">
              <table className="w-full">
                <thead className="bg-blue-600 text-white rounded-t-md sticky top-0">
                  <tr>
                    {titleTable.map((item, index) => (
                      <th key={index} className="text-center h-12">
                        {item}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {resultEmployeeList.map((item, index) => (
                    <tr key={index} className="border-[2px] h-12 bg-slate-100">
                      <td className="text-center border-[2px]">{index + 1}</td>
                      <td className="text-center border-[2px]">
                        {item.fullName}
                      </td>
                      <td className="text-center border-[2px]">
                        {item.gender}
                      </td>
                      <td className="text-center border-[2px]">
                        {
                          jobTitles.find(
                            (job) => job.id === item.jobInformation?.jobTitleId
                          )?.name
                        }
                      </td>
                      <td className="text-center border-[2px]">{item.email}</td>
                      <td className="text-center border-[2px]">
                        {item.phoneNumber}
                      </td>
                      <td className="text-center border-[2px]">
                        {
                          departments.find(
                            (department) =>
                              department.id ===
                              item.jobInformation?.departmentId
                          )?.name
                        }
                      </td>
                      <td className="text-center border-[2px]"></td>
                      <td className="text-center border-[2px]">
                        {item.status}
                      </td>
                      <td className="flex justify-center items-center gap-2 flex-row p-4">
                        <div
                          className="flex justify-center items-center text-lg cursor-pointer text-orange-600"
                          onClick={() =>
                            setIsOpenEditModal({ userInfo: item, isOpen: true })
                          }
                        >
                          <BiEditAlt />
                        </div>
                        <div
                          onClick={() => {
                            setIsModalDeleteOpen(true);
                          }}
                          className="flex justify-center items-center text-lg cursor-pointer text-red-600"
                        >
                          <BiTrashAlt />
                        </div>
                        <Modal
                          title="Bạn muốn xóa nhân viên này?"
                          open={isModalDeleteOpen}
                          width={400}
                          onCancel={() => setIsModalDeleteOpen(false)}
                          footer={[
                            <button
                              onClick={() => setIsModalDeleteOpen(false)}
                              className="w-24 ml-2 rounded-md h-8 bg-red-500 text-white cursor-pointer"
                            >
                              Hủy
                            </button>,
                            <Button
                              onClick={() => handleDeleteUser(item.id)}
                              className="ml-2 w-24 rounded-md h-8 bg-blue-500 text-white cursor-pointer"
                            >
                              Xóa
                            </Button>,
                          ]}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Modal
              onCancel={() =>
                setIsOpenEditModal({
                  isOpen: false,
                  userInfo: {} as UserDetailInformation,
                })
              }
              open={isOpenEditModal.isOpen}
              width={800}
              title="Thông tin nhân viên"
            >
              <EditEmployee userInfo={isOpenEditModal.userInfo} />
            </Modal>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;
