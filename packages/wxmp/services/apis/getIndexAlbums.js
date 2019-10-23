import { post } from '../request';
import { M_DOMAIN } from '../../constants/index';

export default (count = 3) => {
  return post(M_DOMAIN + '/********************', {
    deviceId: '',
    count
  })
}