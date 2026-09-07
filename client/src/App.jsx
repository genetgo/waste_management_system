import AppRoutes from "./routes/AppRoutes";
import useSocketNotification from "./hooks/useSocketNotification";


function App(){

    useSocketNotification();


    return (
        <AppRoutes />
    );

}


export default App;