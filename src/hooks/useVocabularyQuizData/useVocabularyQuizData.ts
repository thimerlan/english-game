import axios from "axios";
import { useState, useEffect } from "react";

const useVocabularyQuizData = () => {
  const [quizQuestions, setQuizQuestions] = useState<VocabularyQuizData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<null>(null);

  useEffect(() => {
    const fetchQuizQuestions = async () => {
      try {
        const response = await axios.get<VocabularyQuizData[]>(
          "https://64998ca979fbe9bcf83f7798.mockapi.io/beginner-VocabularyTest"
        );

        setQuizQuestions(response.data);
      } catch (error: any) {
        setErrorMessage(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizQuestions();
  }, []);

  return { quizQuestions, setQuizQuestions, isLoading, errorMessage };
};

export default useVocabularyQuizData;
