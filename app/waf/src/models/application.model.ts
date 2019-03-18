import {CommonEntity, Declaration, Service} from '.';
import {model, property, hasMany} from '@loopback/repository';

@model()
export class Application extends CommonEntity {
  @property({
    type: 'string',
    schema: {
      response: true,
      example: 'TBD',
    },
  })
  status?: string;

  @hasMany(() => Service, {keyTo: 'applicationId'})
  services?: Service[];

  @hasMany(() => Declaration, {keyTo: 'applicationId'})
  declarations?: Declaration[];

  constructor(data?: Partial<Application>) {
    super(data);
  }
}
