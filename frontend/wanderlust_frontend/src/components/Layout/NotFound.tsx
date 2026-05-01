import { Result, Button } from "antd";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/dashboard");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
        extra={
          <div className="space-x-2">
            <Button type="primary" onClick={handleGoHome}>
              Back to Dashboard
            </Button>
            <Button onClick={handleGoBack}>Go Back</Button>
          </div>
        }
      />
    </div>
  );
};

export default NotFound;
