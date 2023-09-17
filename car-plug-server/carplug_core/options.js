export const GATEWAY = "gateway";
export const DASHBOARD = "dashboard";

export const BUFLEN = 1000000;	//Max length of buffer

export const TIME_BASE         = 10;   // 10 ms
export const SYNC_PERIOD_TICKS = 10;   // 10 * TIME_BASE = 100 ms
export const ALIVE_TIMEOUT     = 2000; // 2 seconds

export const DATA_BYTE_LEN_MAX = 32;
export const SYNC_MESSAGE_LEN_MIN = 7; // ID(4), DLC (1), Status(1), Data(1)

export const CAN_DIRECTION_TX = 0;
export const CAN_DIRECTION_RX = 1;

export const CAN_MSG_STATUS_UPDATED        = 0x01;
export const CAN_MSG_STATUS_CHANGED        = 0x02;
export const CAN_MSG_STATUS_OVERWRITE      = 0x04;
export const CAN_MSG_STATUS_NEVER_SENT     = 0x08;
export const CAN_MSG_STATUS_NEVER_RECEIVED = 0x40;
export const CAN_MSG_STATUS_E2E_PROFILE_05 = 0x10;
export const CAN_MSG_STATUS_E2E_PROFILE_11 = 0x20;
export const CAN_MSG_STATUS_CLEAR_FLAGS = ( CAN_MSG_STATUS_UPDATED | CAN_MSG_STATUS_CHANGED | CAN_MSG_STATUS_OVERWRITE 
									| CAN_MSG_STATUS_NEVER_SENT | CAN_MSG_STATUS_NEVER_RECEIVED );
