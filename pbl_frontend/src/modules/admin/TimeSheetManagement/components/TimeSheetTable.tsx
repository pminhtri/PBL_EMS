import React from "react";

const TimeSheetTable: React.FunctionComponent = () => {
  const [selectedYear, setSelectedYear] = React.useState<number>(2023);
  const [selectedMonth, setSelectedMonth] = React.useState<number>(5);

  // Generate an array of days for the selected month and year
  const generateDaysArray = () => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, index) => index + 1);
  };

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Simulated employee data
  const employeeData = [
    { id: 1, name: "John Doe" },
    { id: 2, name: "Jane Smith" },
    { id: 3, name: "Mike Johnson" },
    // Add more employee data as needed
  ];

  return (
    <div className="w-full border-2 p-6 rounded-md flex flex-col">
      <h2 className="text-2xl font-bold mb-4">Bảng công</h2>

      <div className="flex items-center mb-4">
        <label className="mr-2">Year:</label>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="border border-gray-300 rounded px-2 py-1"
        >
          <option value={2023}>2023</option>
          <option value={2024}>2024</option>
          {/* Add more years as needed */}
        </select>
      </div>

      <div className="flex items-center mb-4">
        <label className="mr-2">Month:</label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          className="border border-gray-300 rounded px-2 py-1"
        >
          <option value={1}>January</option>
          <option value={2}>February</option>
          <option value={3}>March</option>
          <option value={4}>April</option>
          <option value={5}>May</option>
          <option value={6}>June</option>
          <option value={7}>July</option>
          <option value={8}>August</option>
          <option value={9}>September</option>
          <option value={10}>October</option>
          <option value={11}>November</option>
          <option value={12}>December</option>
          {/* Add more months as needed */}
        </select>
      </div>

      <div className="w-full flex overflow-x-auto">
        <div className="relative">
          <table className="w-full border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 h-12 w-[180px] sticky left-0 bg-gray-100 z-10">
                  <div className="flex flex-row h-full">
                    <div className="flex items-center justify-center w-1/4 h-full text-gray-700 border-r border-gray-300">
                      Id
                    </div>
                    <div className="flex items-center justify-center w-3/4 text-gray-700 h-full">
                      Họ và tên
                    </div>
                  </div>
                </th>
                {generateDaysArray().map((day) => (
                  <th
                    key={day}
                    className="border border-gray-300 text-center"
                  >
                    <div className="w-10">
                      <div>{day}</div>
                      <div className="text-sm text-gray-500">
                        {
                          daysOfWeek[
                            new Date(
                              selectedYear,
                              selectedMonth - 1,
                              day
                            ).getDay()
                          ]
                        }
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employeeData.map((employee) => (
                <tr key={employee.id}>
                  <td className="border-b border-gray-300 w-[180px] flex flex-row text-center justify-center items-center h-12 sticky left-0 bg-gray-100 z-10">
                    <div className="flex items-center justify-center w-1/4 h-full text-sm font-semibold border-r border-gray-300">
                      {employee.id}
                    </div>
                    <div className="flex items-center justify-center w-3/4 h-full text-gray-700">
                      {employee.name}
                    </div>
                  </td>
                  {generateDaysArray().map((day) => (
                    <td
                      key={day}
                      className={`border border-gray-300 w-32 text-center ${
                        [0, 6].includes(
                          new Date(
                            selectedYear,
                            selectedMonth - 1,
                            day
                          ).getDay()
                        )
                          ? "bg-yellow-200"
                          : ""
                      }`}
                    >
                      {/* Add payroll data for each employee and day */}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="absolute top-0 left-0 w-30 h-full bg-gray-100 z-20 pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
};

export default TimeSheetTable;