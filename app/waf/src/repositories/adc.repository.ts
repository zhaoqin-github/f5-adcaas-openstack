import {DefaultCrudRepository} from '@loopback/repository';
import {ADC} from '../models';
import {DbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class ADCRepository extends DefaultCrudRepository<
  ADC,
  typeof ADC.prototype.id
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(ADC, dataSource);
  }
}
