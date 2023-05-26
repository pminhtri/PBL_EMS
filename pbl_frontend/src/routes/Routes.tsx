import React from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes as Switch,
} from "react-router-dom";
import LoginPage from "../modules/auth/LoginPage";
import Admin from "../modules/admin/Admin";
import Dashboard from "../modules/admin/Dashboard";
import EmployeeManagement from "../modules/admin/EmployeeManagement/EmployeeManagement";
import Auth from "../modules/auth/Auth";
import { useRecoilState, useRecoilValue } from "recoil";
import { userAuthState } from "../recoil/atoms/user";
import { UserAction } from "../actions/userAction";
import Account from "../modules/Account";
import Employee from "../modules/employee/Employee";
import authSelector from "../recoil/selectors/auth";
import TimeSheetPage from "../modules/employee/TimeSheet";
import LeaveManagement from "../modules/admin/LeaveManagement/LeaveManagement";

export enum RoleEnum {
  ADMIN = "Admin",
  EMPLOYEE = "Employee",
}

const AuthenticatedRoute: React.FunctionComponent<{
  element: React.ReactNode;
}> = ({ element }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/auth/login" replace />;
  }

  return <>{element}</>;
};

const Routes: React.FunctionComponent = () => {
  const token = localStorage.getItem("token");

  const { auth } = useRecoilValue(authSelector);
  const [userBasicInfo, setUserBasicInfo] = useRecoilState(userAuthState);

  React.useEffect(() => {
    if (token) {
      setUserBasicInfo(UserAction.getAuthInfo(token));
    }

    if (auth.isAuthenticated) {
      if (userBasicInfo.role === RoleEnum.ADMIN) {
        window.location.href = "/admin/dashboard";
      }
      if (userBasicInfo.role === RoleEnum.EMPLOYEE) {
        window.location.href = "/employee";
      }
    }
  }, [token, setUserBasicInfo, userBasicInfo.role, auth.isAuthenticated]);

  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" element={<Navigate to="/auth/login" replace />} />
        <Route
          path="/auth/*"
          element={
            !token ? (
              <Auth />
            ) : (
              <Navigate
                to={
                  userBasicInfo.role === RoleEnum.ADMIN ? "/admin" : "/employee"
                }
                replace
              />
            )
          }
        >
          <Route path="login" element={<LoginPage />} />
        </Route>
        {RoleEnum.ADMIN && (
          <Route
            path="/admin/*"
            element={<AuthenticatedRoute element={<Admin />} />}
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="employees" element={<EmployeeManagement />} />
            <Route path="leaves" element={<LeaveManagement />} />
          </Route>
        )}
        {RoleEnum.EMPLOYEE && (
          <Route
            path="/employee/*"
            element={<AuthenticatedRoute element={<Employee />} />}
          >
            <Route path="time-sheet" element={<TimeSheetPage />} />
          </Route>
        )}
        <Route
          path="/account"
          element={<AuthenticatedRoute element={<Account />} />}
        />
      </Switch>
    </BrowserRouter>
  );
};

export default Routes;
