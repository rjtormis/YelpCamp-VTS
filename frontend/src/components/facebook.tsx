import { BiLogoFacebookCircle } from "react-icons/bi";
import { FacebookLoginClient } from "@greatsumini/react-facebook-login";
import { useEffect } from "react";
import YelpCamp from "@actions/config";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { authenticate, loading } from "@store/features/userSlice";

function FacebookComponent() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    const initialization = async () => {
      await FacebookLoginClient.loadSdk("en_US");
      FacebookLoginClient.init({ appId: "964651414807742", version: "v16.0" });
    };

    initialization();
  }, []);
  const handleFBLogin = async () => {
    dispatch(loading({ loading: true }));
    FacebookLoginClient.login(
      () => {
        FacebookLoginClient.getProfile(
          async (res: any) => {
            const data = {
              emailAddress: res.email,
              name: res.name,
              profileImage: res.picture.data.url,
              provider: "FACEBOOK",
            };

            try {
              const response = await YelpCamp.post("/users", { ...data });
              const { user, token } = response.data;
              dispatch(
                authenticate({
                  id: user._id,
                  email: user.emailAddress,
                  token,
                  picture: user.profileImage,
                  name: user.name,
                })
              );
              dispatch(loading({ loading: false }));
              if (response.status === 201 || response.status === 200)
                navigate("/dashboard", { state: { from: location.pathname } });
            } catch (e) {
              dispatch(loading({ loading: false }));
              console.log(e);
            }
          },
          {
            fields: "name,email,picture",
          }
        );
      },
      {
        scope: "public_profile, email",
      }
    );
  };

  return (
    <button className="btn btn-ghost" onClick={handleFBLogin}>
      <BiLogoFacebookCircle color="blue" className="align-middle my-auto  w-[24px] h-[24px]" />{" "}
      <span>Facebook</span>
    </button>
  );
}
export default FacebookComponent;
