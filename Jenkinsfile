node('lisk-explorer-01'){
  lock(resource: "lisk-explorer-01", inversePrecedence: true) {
    stage ('Prepare Workspace') {
      sh '''#!/bin/bash
      pkill -f app.js || true
      bash ~/lisk-test/lisk.sh stop
      '''
      deleteDir()
      checkout scm

    }

    stage ('Build Dependencies') {
      try {
        sh '''#!/bin/bash

        # Install Deps
        npm install --verbose
        '''
      } catch (err) {
        currentBuild.result = 'FAILURE'
        error('Stopping build, installation failed')
      }
    }

    stage ('Run Webpack Build') {
      try {
        sh '''#!/bin/bash
        # Build Bundles
        npm run build
        '''
      } catch (err) {
        currentBuild.result = 'FAILURE'
        error('Stopping build, webpack failed')
      }
    }

    stage ('Build Candles') {
      try {
        sh '''#!/bin/bash
        # Generate market data
        grunt candles:build
        '''
      } catch (err) {
        currentBuild.result = 'FAILURE'
        error('Stopping build, candles build failed')
      }
    }

    stage ('Start Lisk ') {
      try {
        sh '''#!/bin/bash
        bash ~/lisk-test/lisk.sh rebuild -f ~/lisk-test/blockchain_explorer.db.gz
        '''
      } catch (err) {
        currentBuild.result = 'FAILURE'
        error('Stopping build, lisk-core failed')
      }
    }

    stage ('Start Explorer') {
      try {
      sh '''#!/bin/bash

      cp test/config.test ./config.js
      node $(pwd)/app.js &> ./explorer.log &
      sleep 5
      '''
      } catch (err) {
        currentBuild.result = 'FAILURE'
        error('Stopping build, Explorer failed to start')
      }
    }

    stage ('Run tests') {
      try {
        sh '''#!/bin/bash
        # Run Tests
        npm run test
        '''
      } catch (err) {
        sh '''#!/bin/bash
            # Stop Lisk-Node
            bash ~/lisk-test/lisk.sh stop

            # Stop Lisk-Explorer
            pkill -f $(pwd)/app.js || true
        '''
        currentBuild.result = 'FAILURE'
        error('Stopping build, tests failed')
      }
    }

    stage ('Run e2e tests') {
      try {
        sh '''#!/bin/bash

        # End to End test configuration
        export DISPLAY=:99
        Xvfb :99 -ac -screen 0 1280x1024x24 &
        ./node_modules/protractor/bin/webdriver-manager update
        ./node_modules/protractor/bin/webdriver-manager start &

        # Run E2E Tests
        npm run e2e-test
        '''
      } catch (err) {
        sh '''#!/bin/bash
            # Stop Lisk-Node
            bash ~/lisk-test/lisk.sh stop

            # Stop Lisk-Explorer
            pkill -f $(pwd)/app.js || true
        '''
        currentBuild.result = 'FAILURE'
        error('Stopping build, e2e tests failed')
      }
    }

    stage ('Set milestone') {
      milestone 1
      currentBuild.result = 'SUCCESS'
    }

    stage ('Cleanup') {
      sh '''#!/bin/bash
          # Stop Lisk-Node
          bash ~/lisk-test/lisk.sh stop

          # Stop Lisk-Explorer
          pkill -f $(pwd)/app.js || true
      '''
    }
  }
}
