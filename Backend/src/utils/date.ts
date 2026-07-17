import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const formatDate = (date: Date | string, format = 'YYYY-MM-DD HH:mm:ss'): string => {
  return dayjs(date).format(format);
};

export const getCurrentDate = (): Date => {
  return dayjs().toDate();
};

export const addDays = (date: Date, days: number): Date => {
  return dayjs(date).add(days, 'day').toDate();
};

export const addMinutes = (date: Date, minutes: number): Date => {
  return dayjs(date).add(minutes, 'minute').toDate();
};

export const isExpired = (date: Date): boolean => {
  return dayjs(date).isBefore(dayjs());
};

export const getDifferenceInSeconds = (start: Date, end: Date): number => {
  return dayjs(end).diff(dayjs(start), 'second');
};

export const getDifferenceInDays = (start: Date, end: Date): number => {
  return dayjs(end).diff(dayjs(start), 'day');
};

export const toUTC = (date: Date): Date => {
  return dayjs(date).utc().toDate();
};

export const fromUTC = (date: Date, tz = 'Asia/Kolkata'): Date => {
  return dayjs.utc(date).tz(tz).toDate();
};
