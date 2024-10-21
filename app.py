from flask import Flask, render_template, jsonify, session
import random
from flask_session import Session
from flask_cors import CORS


app = Flask(__name__)
CORS(app)

# Set a secret key for session management
app.secret_key = 'supersecretkey'
app.config['SESSION_TYPE'] = 'filesystem'
Session(app)

TARGET = 10
questions = []
answers = []

# Load questions and answers from files
with open("questions.txt") as q_file:
    questions = q_file.readlines()

with open("answers.txt") as a_file:
    answers = a_file.readlines()

seen = set()


@app.route('/')
def index():
    # Initialize the score and question count in session
    if 'score' not in session:
        session['score'] = 0
        session['questions_asked'] = 0
    return render_template('index.html')


@app.route('/get_question', methods=['GET'])
def get_question():
    global seen, questions, answers

    if len(seen) >= TARGET:
        return jsonify({'error': 'No more questions available'}), 404

    # Pick a random question that hasn't been seen
    while True:
        num = random.randint(0, TARGET - 1)
        if num not in seen:
            seen.add(num)
            break

    # Swap questions and answers randomly
    if random.randint(0, 1):
        questions, answers = answers, questions

    question = questions[num].strip()
    correct_answer = answers[num].strip()

    # Store the correct answer in the session for comparison later
    session['correct_answer'] = correct_answer

    # Create 4 options, including the correct answer
    options = [correct_answer]
    chosen = {num}
    while len(options) < 4:
        opt = random.randint(0, TARGET - 1)
        if opt not in chosen:
            options.append(answers[opt].strip())
            chosen.add(opt)

    random.shuffle(options)

    session['questions_asked'] += 1  # Increment question count

    return jsonify({
        'question': question,
        'options': options,
        'correct_answer': correct_answer,  # Include correct answer in response
        'score': session['score'],
        'questions_asked': session['questions_asked']
    })


@app.route('/update_target/<int:new_target>', methods=['POST'])
def update_target(new_target):
    global TARGET  # Access the global TARGET variable
    TARGET = new_target
    return jsonify({'message': f'Target updated to {TARGET} questions.'})


@app.route('/submit_answer/<answer>', methods=['POST'])
def submit_answer(answer):
    # Get the correct answer from the session
    correct_answer = session.get('correct_answer')

    # Check if the submitted answer matches the correct answer (case insensitive and trimmed)
    if answer.strip().lower() == correct_answer.strip().lower():
        session['score'] += 1  # Increment score if correct
        return jsonify({'result': 'correct', 'score': session['score']})
    else:
        return jsonify({'result': 'wrong', 'score': session['score'], 'correct_answer': correct_answer})


@app.route('/reset_score', methods=['POST'])
def reset_score():
    # Reset the score and question count in the session
    session['score'] = 0
    session['questions_asked'] = 0
    return jsonify({'message': 'Score reset successfully'})


if __name__ == "__main__":
    app.run(debug=True)
