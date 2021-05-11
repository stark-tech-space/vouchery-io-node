import dotenv from 'dotenv';
import VoucheryIO from '../src/api';

dotenv.config();

const voucheryIO = new VoucheryIO({
  url: process.env.VOUCHERY_IO_BASE_URL,
  apiKey: process.env.VOUCHERY_IO_API_KEY,
});

describe('example test', () => {
  it('should be truthy', () => {
    expect(true).toBeTruthy();
  });
});
