import { useContext, createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import axiosConfig from "../../util/AxiosConfig/AxiosConfig";
import { ApiConstants } from "../../constants/ApiConstants";
import { PathConstants } from "../../constants/PathConstants";
import { HeaderNameConstants } from "../../constants/HttpConstants";
import { LocalStorageConstants } from "../../constants/LocalStorageConstants";
import { parseErrorMessage } from "../../util/ErrorMessage/ErrorMessage";

const AuthenticationContext = createContext();

const AuthenticationProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [csrfToken, setCsrfToken] = useState(
    localStorage.getItem(LocalStorageConstants.XSRF_TOKEN) || ""
  );
  const [errorMessages, setErrorMessages] = useState(new Map());

  const navigate = useNavigate();

  const signinAction = async (data) => {
    try {
      const response = await axiosConfig.post(ApiConstants.SIGNIN, {
        username: data.username,
        password: data.password,
      });

      if (response.data) {
        const currentUser = response.data;
        setUser(currentUser);
        const currentCsrfToken = response.headers.get(HeaderNameConstants.XSRF_TOKEN);
        setCsrfToken(currentCsrfToken);
        localStorage.setItem(LocalStorageConstants.XSRF_TOKEN, currentCsrfToken);
        setErrorMessages([]);
        navigate(PathConstants.SIGNOUT);
        return;
      }
    } catch (error) {
      setErrorMessages(parseErrorMessage(error));
    }
  };

  const signoutAction = async () => {
    try {
      const response = await axiosConfig.post(ApiConstants.SIGNOUT);

      if (
        response.data &&
        response.data.message === "You have been signed out!"
      ) {
        const currentUser = null;
        setUser(currentUser);
        const currentCsrfToken = "";
        setCsrfToken(currentCsrfToken);
        localStorage.removeItem(LocalStorageConstants.XSRF_TOKEN);
        setErrorMessages([]);
        navigate(PathConstants.SIGNIN);
      }
    } catch (error) {
      setErrorMessages(parseErrorMessage(error));
    }
  };

  return (
    <AuthenticationContext.Provider
      value={{
        csrfToken,
        user,
        signinAction,
        signoutAction,
        errorMessages,
      }}
    >
      {children}
    </AuthenticationContext.Provider>
  );
};

AuthenticationProvider.propTypes = {
  children: PropTypes.element.isRequired,
};

export default AuthenticationProvider;

export const useAuthentication = () => {
  return useContext(AuthenticationContext);
};
