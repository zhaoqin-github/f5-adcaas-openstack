/**
 * Copyright 2019 F5 Networks, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {getService} from '@loopback/service-proxy';
import {inject, Provider} from '@loopback/core';
import {BigIqDataSource} from '../datasources';
import {factory} from '../log4ts';
import {Logger} from 'typescript-logging';
import {checkAndWait} from '../utils';

const BIGIQ_HOST: string = process.env.BIGIQ_HOST || 'localhost';
const BIGIQ_PORT: number = Number(process.env.BIGIQ_PORT) || 8888;
const BIGIQ_USERNAME: string = process.env.BIGIQ_USERNAME || 'admin';
const BIGIQ_PASSWORD: string = process.env.BIGIQ_PASSWORD || 'admin';
const BIGIQ_POOL: string = process.env.BIGIQ_POOL || 'unknown';

type BigIqToken = {
  token: string;
  exp: number;
};

type LoginResponse = {
  token: BigIqToken;
};

type RevokeResponse = {
  id: string;
};

type QueryResponse = {
  status: string;
  errorMessage: string;
};

export interface BigIqService {
  login(
    host: string,
    port: number,
    username: string,
    password: string,
  ): Promise<LoginResponse>;

  revoke(
    host: string,
    port: number,
    token: string,
    pool: string,
    address: string,
  ): Promise<RevokeResponse>;

  query(
    host: string,
    port: number,
    token: string,
    task: string,
  ): Promise<QueryResponse>;
}

export class BigIqServiceProvider implements Provider<BigIqService> {
  constructor(
    @inject('datasources.bigiq')
    protected dataSource: BigIqDataSource = new BigIqDataSource(),
  ) {}

  value(): Promise<BigIqService> {
    return getService(this.dataSource);
  }
}

export class BigIqManager {
  private service: BigIqService;
  private logger: Logger;
  private static token: BigIqToken;

  constructor(svc: BigIqService, reqId = 'Unknown') {
    this.service = svc;
    this.logger = factory.getLogger(reqId + ': services.BigIqManager');
  }

  async login(): Promise<BigIqToken> {
    let current = new Date().getTime() / 1000;
    // Login BIG-IQ, if no token or token will expire in 30 seconds
    if (!BigIqManager.token || current > BigIqManager.token.exp - 30) {
      let resp = await this.service.login(
        BIGIQ_HOST,
        BIGIQ_PORT,
        BIGIQ_USERNAME,
        BIGIQ_PASSWORD,
      );
      BigIqManager.token = resp.token;
      this.logger.debug(`BIG-IQ token will expire at ${resp.token.exp}`);
    }

    return BigIqManager.token;
  }

  async revokeLicense(
    address: string,
    pool: string = BIGIQ_POOL,
  ): Promise<void> {
    let token = await this.login();
    let revokeResp = await this.service.revoke(
      BIGIQ_HOST,
      BIGIQ_PORT,
      token.token,
      pool,
      address,
    );

    let taskFinished = async (taskId: string): Promise<boolean> => {
      return this.service
        .query(BIGIQ_HOST, BIGIQ_PORT, token.token, taskId)
        .then(
          resp => {
            this.logger.debug(`Revoking license task status is ${resp.status}`);
            switch (resp.status) {
              case 'FINISHED':
                return true;
              case 'FAILED':
                Promise.reject(resp.errorMessage);
              default:
                return false;
            }
          },
          err => Promise.reject(err),
        );
    };

    await checkAndWait(taskFinished, 30, [revokeResp.id]);
  }
}
