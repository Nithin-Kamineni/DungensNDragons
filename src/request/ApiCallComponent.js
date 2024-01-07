import axios from 'axios';
import { getUrlPrefix } from '../public-url';

async function ApiCallComponent(request) {
    let responseData;
    // const API = process.env.REACT_APP_API_URL;
    const API = getUrlPrefix();
    switch (request.requestType) {
        case "GET":
            await axios.get(API+`${request.apiPath}`)
                .then(response => {
                    responseData = response.data;
                })
                .catch(error => {
                    console.error('Error in GET request:', error);
                });
            break;
        case "POST"://https://dev-121kzskg8654455.api.raw-labs.com/json-programming-heroes
            const body = request.body ? request.body : {}
            console.log("post requsst")
            await axios.post(API+`${request.apiPath}`, body)
                .then(response => {
                    responseData = response.data;
                })
                .catch(error => {
                    console.error('Error in POST request:', error);
                });
            break;
        case "PUT":
            break;
        case "PATCH":
            break;
        case "DELETE":
            break;
        default:
      }
      
      return responseData;
}

export default ApiCallComponent;
