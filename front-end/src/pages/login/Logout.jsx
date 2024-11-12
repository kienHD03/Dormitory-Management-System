import { googleLogout } from "@react-oauth/google";
const Logout = () => {
  return (
    <div id="signOutButton">
      <googleLogout
        clientId={import.meta.env.VITE_CLIENT_ID}
        buttonText="Sign Out"
        onLogoutSuccess={() => {
          console.log("logout success");
        }}
      />
    </div>
  );
};

export default Logout;
