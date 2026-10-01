pipeline {

    agent any

    stages {

        stage('Checkout') {
            steps {
                echo 'Checking out project from GitHub...'
            }
        }

        stage('Build') {
            steps {
                echo 'Building Student Task Manager...'

                bat '''
                    if not exist index.html exit /b 1
                    if not exist style.css exit /b 1
                    if not exist script.js exit /b 1
                '''
            }
        }

        stage('Test') {
            steps {
                echo 'Running project validation...'

                bat '''
                    findstr /C:"Student Task Manager" index.html
                    findstr /C:"addTask" script.js
                '''
            }
        }

        stage('Deploy') {
            steps {
                echo 'Project deployment stage completed.'
            }
        }

    }

    post {

        success {
            echo 'CI/CD Pipeline completed successfully!'
        }

        failure {
            echo 'Pipeline failed. Check the console output.'
        }

    }
}