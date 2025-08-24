import { useNavigate } from "react-router-dom";

const useGeneral = () => {
    const navigate = useNavigate();
    return {
        navigate
    }
}
export default useGeneral;