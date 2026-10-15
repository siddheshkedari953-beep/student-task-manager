pipeline {
    agent any

    environment {
        // ===== CHANGE THESE 3 VALUES =====
        AWS_REGION  = 'ap-south-1'
        ACCOUNT_ID  = '123456789012'
        ECR_REPO    = 'student-task-manager'
        // =================================
        REGISTRY    = "${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
        IMAGE_TAG   = "${BUILD_NUMBER}"
        IMAGE_URI   = "${REGISTRY}/${ECR_REPO}:${IMAGE_TAG}"
    }

    stages {

        stage('Checkout') {
            steps {
                echo 'Checking out source from GitHub'
                checkout scm
            }
        }

        stage('Build') {
            steps {
                echo 'Validating project files'
                sh '''
                    set -eu
                    test -f index.html
                    test -f style.css
                    test -f script.js
                    test -f Dockerfile
                '''
            }
        }

        stage('Test') {
            steps {
                echo 'Running project validation'
                sh '''
                    set -eu
                    grep -q "Student Task Manager" index.html
                    grep -q 'src="script.js"' index.html
                    grep -q 'href="style.css"' index.html
                    grep -q "class TaskManager" script.js

                    # Syntax check only if Node.js is installed on this Jenkins machine
                    if command -v node >/dev/null 2>&1; then
                        node --check script.js
                    else
                        echo "Node.js not found, skipping JS syntax check"
                    fi
                '''
            }
        }

        stage('Docker Build') {
            steps {
                echo "Building image ${IMAGE_URI}"
                sh '''
                    set -eu
                    docker build -t "${ECR_REPO}:${IMAGE_TAG}" .
                    docker tag "${ECR_REPO}:${IMAGE_TAG}" "${IMAGE_URI}"
                    docker tag "${ECR_REPO}:${IMAGE_TAG}" "${REGISTRY}/${ECR_REPO}:latest"
                '''
            }
        }

        stage('Push to Amazon ECR') {
            steps {
                echo 'Logging in to ECR and pushing image'
                // Uses the EC2 instance IAM role. If you use access keys instead,
                // wrap this in withCredentials([...]) with your AWS credentials ID.
                sh '''
                    set -eu
                    aws ecr get-login-password --region "${AWS_REGION}" \
                      | docker login --username AWS --password-stdin "${REGISTRY}"
                    docker push "${IMAGE_URI}"
                    docker push "${REGISTRY}/${ECR_REPO}:latest"
                '''
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                echo 'Deploying to Kubernetes'
                sh '''
                    set -eu
                    sed "s|IMAGE_PLACEHOLDER|${IMAGE_URI}|g" k8s/deployment.yaml > k8s/deployment.rendered.yaml
                    kubectl apply -f k8s/deployment.rendered.yaml
                    kubectl rollout status deployment/student-task-manager --timeout=120s
                    kubectl get pods -l app=student-task-manager
                    kubectl get svc student-task-manager-service
                '''
            }
        }
    }

    post {
        success {
            echo "SUCCESS: ${IMAGE_URI} is deployed."
        }
        failure {
            echo 'FAILED: Check the Jenkins Console Output for the error.'
        }
        always {
            sh 'docker image prune -f || true'
        }
    }
}
