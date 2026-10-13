pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out project from GitHub...'
                checkout scm
            }
        }

        stage('Build') {
            steps {
                echo 'Building Student Task Manager...'
                sh '''
                    test -f index.html
                    test -f style.css
                    test -f script.js
                '''
            }
        }

        stage('Test') {
            steps {
                echo 'Running project validation...'
                sh '''
                    grep -q "Student Task Manager" index.html
                    grep -q "addTask" script.js
                '''
            }
        }

        stage('Deploy') {
            steps {
                echo 'Basic project validation completed.'
                echo 'Docker, ECR and Kubernetes deployment will be added next.'
            }
        }
    }

    post {
        success {
            echo 'CI pipeline completed successfully!'
        }

        failure {
            echo 'Pipeline failed. Check the console output.'
        }
    }
}
