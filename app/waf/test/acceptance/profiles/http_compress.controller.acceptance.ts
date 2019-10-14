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

import {Client, expect} from '@loopback/testlab';
import {WafApplication} from '../../..';
import {
  setupApplication,
  teardownApplication,
  setupEnvs,
  teardownEnvs,
  setupDepApps,
  teardownDepApps,
} from '../../helpers/testsetup-helper';
import {
  givenEmptyDatabase,
  createProfileHTTPCompressionObject,
  givenProfileHTTPCompressionData,
} from '../../helpers/database.helpers';
import {
  ExpectedData,
  LetResponseWith,
} from '../../fixtures/datasources/testrest.datasource';

describe('ProfileHTTPCompressionController', () => {
  let wafapp: WafApplication;
  let client: Client;

  const prefix = '/adcaas/v1/profiles';

  before('setupApplication', async () => {
    await setupDepApps();
    ({wafapp, client} = await setupApplication());
    LetResponseWith();
    setupEnvs();
  });
  beforeEach('Empty database', async () => {
    await givenEmptyDatabase(wafapp);
  });

  after(async () => {
    await teardownApplication(wafapp);
    await teardownDepApps();
    teardownEnvs();
  });

  it('post ' + prefix + '/http_compress_profiles', async () => {
    const prof = createProfileHTTPCompressionObject();
    const response = await client
      .post(prefix + `/http_compress_profiles`)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send(prof)
      .expect(200);

    expect(response.body.profilehttpcompression.id)
      .to.not.empty()
      .and.type('string');
  });

  it('get ' + prefix + '/http_compress_profiles', async () => {
    await givenProfileHTTPCompressionData(wafapp);

    const response = await client
      .get(prefix + `/http_compress_profiles`)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(200);

    expect(response.body.profilehttpcompressions)
      .be.instanceOf(Array)
      .and.have.length(1);
  });

  it('delete ' + prefix + '/http_compress_profiles/{id}', async () => {
    const prof = await givenProfileHTTPCompressionData(wafapp);

    await client
      .del(prefix + `/http_compress_profiles/${prof.id}`)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(204);

    let response = await client
      .get(prefix + `/http_compress_profiles`)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(200);

    expect(response.body.profilehttpcompressions)
      .be.instanceOf(Array)
      .and.have.length(0);
  });
});
