pipeline {
  agent any
  stages {
    stage('package') {
      agent {
        dockerfile {
          filename 'ci/package/Dockerfile'
        }

      }
      steps {
        sh 'npm run package-all'
        sh 'cd release-builds && for i in */; do zip -r "${i%/}.zip" "$i"; done'
        archiveArtifacts '*.zip'
      }
    }

  }
}