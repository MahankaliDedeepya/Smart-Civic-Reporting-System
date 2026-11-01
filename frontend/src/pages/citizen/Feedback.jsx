import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";

function Feedback() {

  const { id } = useParams();

  const navigate = useNavigate();

  const [rating, setRating] = useState(5);

  const [comment, setComment] =
    useState("");

  const submitFeedback = () => {

    const feedback =
      JSON.parse(
        localStorage.getItem("feedback")
      ) || [];

    feedback.push({

      complaintId: id,

      rating,

      comment,

      date:
        new Date().toISOString()

    });

    localStorage.setItem(
      "feedback",
      JSON.stringify(feedback)
    );

    alert(
      "Thank you for your feedback!"
    );

    navigate("/complaints");
  };

  return (

    <div>

      <Navbar />

      <div className="form-container">

        <h1>
          Complaint Feedback
        </h1>

        <p>
          Was your issue resolved?
        </p>

        <h2>
          Rate the resolution
        </h2>

        <select
          value={rating}
          onChange={(e) =>
            setRating(Number(e.target.value))
          }
        >

          <option value="5">
            ⭐⭐⭐⭐⭐
          </option>

          <option value="4">
            ⭐⭐⭐⭐
          </option>

          <option value="3">
            ⭐⭐⭐
          </option>

          <option value="2">
            ⭐⭐
          </option>

          <option value="1">
            ⭐
          </option>

        </select>

        <label>
          Your feedback
        </label>

        <textarea
          value={comment}
          onChange={(e) =>
            setComment(e.target.value)
          }
          placeholder="Tell us about your experience..."
        />

        <button
          className="submit-btn"
          onClick={submitFeedback}
        >
          Submit Feedback
        </button>

      </div>

    </div>
  );
}

export default Feedback;