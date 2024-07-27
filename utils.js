const questions = require('./questions.json');
const { Random } = require('random-js');

const getRandomQuestion = (topic) => {
    const random = new Random();

    const questionTopic = topic.toLocaleLowerCase();

    const randomQuestionIndex = random.integer(
        0,
        questions[questionTopic].length - 1,
        );

    return questions[questionTopic][randomQuestionIndex];
};

const getCorrectAnswer = (topic, id) => {
    const question = questions[topic].find((question) => question.id === id);

    if (!question.hasOptions) {
        return question.answer;
    }

    return question.options.find((option) => option.isCorrect).text();
}

module.exports = { getRandomQuestion, getCorrectAnswer };