import axios from "axios";

const API_URL = "https://estoque-techprol.onrender.com/";

export default axios.create({
    baseURL: API_URL,
});
