import Navbar from "../../components/Navbar";

function Notifications() {

  const notifications = [
    {
      id: 1,
      message:
        "Your complaint will appear here when its status changes.",
      date: new Date().toLocaleString()
    }
  ];

  return (

    <div>

      <Navbar />

      <div className="page-container">

        <h1>Notifications</h1>

        {notifications.map(
          (notification) => (

            <div
              className="notification"
              key={notification.id}
            >

              <p>
                🔔 {notification.message}
              </p>

              <small>
                {notification.date}
              </small>

            </div>

          )
        )}

      </div>

    </div>
  );
}

export default Notifications;