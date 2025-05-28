const EventEmitter = require('eventemitter3');
const WebSocket = require('ws');
const { getWebSocketUrl } = require('../utils/wrapper');

/**
 * @typedef {Object} TransactionData
 * @property {string} tx - Transaction hash
 * @property {number} amount - Transaction amount
 * @property {number} priceUsd - Price in USD
 * @property {number} volume - Transaction volume
 * @property {string} type - Transaction type ('buy' or 'sell')
 * @property {string} wallet - Wallet address
 * @property {number} time - Transaction timestamp
 * @property {string} program - Program name
 */

/**
 * @typedef {Object} PriceData
 * @property {number} price - Current price
 * @property {number} price_quote - Quote price
 * @property {string} pool - Pool address
 * @property {string} token - Token address
 * @property {number} time - Update timestamp
 */

/**
 * @typedef {Object} TokenData
 * @property {Object} token - Token information
 * @property {Array<Object>} pools - Pool information
 * @property {Object} events - Price change events
 * @property {Object} risk - Risk assessment data
 */

/**
 * Room types for WebSocket subscriptions
 * @enum {string}
 */
const ROOM_TYPES = {
  LATEST: 'latest',
  POOL: 'pool',
  TRANSACTION: 'transaction',
  PRICE: 'price',
  PRICE_BY_TOKEN: 'price-by-token',
  WALLET: 'wallet',
  GRADUATING: 'graduating',
  GRADUATED: 'graduated',
  METADATA: 'metadata',
  HOLDERS: 'holders',
  TOKEN: 'token'
};

/**
 * Base subscriber class for all WebSocket subscriptions
 */
class BaseSubscriber {
  /**
   * @param {WebSocketService} wsService - WebSocket service instance
   */
  constructor(wsService) {
    this.wsService = wsService;
    this.subscriptions = new Set();
  }

  /**
   * Subscribe to an event
   * @param {string} room - Room name
   * @param {Function} callback - Event callback
   */
  subscribe(room, callback) {
    this.wsService.joinRoom(room);
    this.wsService.on(room, callback);
    this.subscriptions.add({ room, callback });
  }

  /**
   * Unsubscribe from an event
   * @param {string} room - Room name
   * @param {Function} callback - Event callback
   */
  unsubscribe(room, callback) {
    this.wsService.leaveRoom(room);
    this.wsService.off(room, callback);
    this.subscriptions.delete({ room, callback });
  }

  /**
   * Unsubscribe from all events
   */
  unsubscribeAll() {
    for (const { room, callback } of this.subscriptions) {
      this.unsubscribe(room, callback);
    }
  }
}

/**
 * Transaction subscriber for monitoring token transactions
 */
class TransactionSubscriber extends BaseSubscriber {
  /**
   * Subscribe to all transactions for a token
   * @param {string} tokenAddress - Token address
   * @param {Function} callback - Transaction callback
   */
  subscribeToToken(tokenAddress, callback) {
    const room = `${ROOM_TYPES.TRANSACTION}:${tokenAddress}`;
    this.subscribe(room, callback);
  }

  /**
   * Subscribe to transactions for a specific pool
   * @param {string} tokenAddress - Token address
   * @param {string} poolId - Pool ID
   * @param {Function} callback - Transaction callback
   */
  subscribeToPool(tokenAddress, poolId, callback) {
    const room = `${ROOM_TYPES.TRANSACTION}:${tokenAddress}:${poolId}`;
    this.subscribe(room, callback);
  }

  /**
   * Subscribe to transactions for a specific wallet in a pool
   * @param {string} tokenAddress - Token address
   * @param {string} poolId - Pool ID
   * @param {string} walletAddress - Wallet address
   * @param {Function} callback - Transaction callback
   */
  subscribeToWalletInPool(tokenAddress, poolId, walletAddress, callback) {
    const room = `${ROOM_TYPES.TRANSACTION}:${tokenAddress}:${poolId}:${walletAddress}`;
    this.subscribe(room, callback);
  }
}

/**
 * Price subscriber for monitoring token prices
 */
class PriceSubscriber extends BaseSubscriber {
  /**
   * Subscribe to price updates for a pool
   * @param {string} poolId - Pool ID
   * @param {Function} callback - Price update callback
   */
  subscribeToPool(poolId, callback) {
    const room = `${ROOM_TYPES.PRICE}:${poolId}`;
    this.subscribe(room, callback);
  }

  /**
   * Subscribe to price updates for a token (highest liquidity pool)
   * @param {string} tokenId - Token ID
   * @param {Function} callback - Price update callback
   */
  subscribeToToken(tokenId, callback) {
    const room = `${ROOM_TYPES.PRICE_BY_TOKEN}:${tokenId}`;
    this.subscribe(room, callback);
  }
}

/**
 * Token subscriber for monitoring token events
 */
class TokenSubscriber extends BaseSubscriber {
  /**
   * Subscribe to latest tokens and pools
   * @param {Function} callback - Update callback
   */
  subscribeToLatest(callback) {
    this.subscribe(ROOM_TYPES.LATEST, callback);
  }

  /**
   * Subscribe to graduating tokens
   * @param {Function} callback - Update callback
   * @param {number} [marketCapThreshold] - Market cap threshold in SOL
   */
  subscribeToGraduating(callback, marketCapThreshold) {
    const room = marketCapThreshold
      ? `${ROOM_TYPES.GRADUATING}:sol:${marketCapThreshold}`
      : ROOM_TYPES.GRADUATING;
    this.subscribe(room, callback);
  }

  /**
   * Subscribe to graduated tokens
   * @param {Function} callback - Update callback
   */
  subscribeToGraduated(callback) {
    this.subscribe(ROOM_TYPES.GRADUATED, callback);
  }

  /**
   * Subscribe to token metadata updates
   * @param {string} tokenAddress - Token address
   * @param {Function} callback - Update callback
   */
  subscribeToMetadata(tokenAddress, callback) {
    const room = `${ROOM_TYPES.METADATA}:${tokenAddress}`;
    this.subscribe(room, callback);
  }

  /**
   * Subscribe to holder count updates
   * @param {string} tokenAddress - Token address
   * @param {Function} callback - Update callback
   */
  subscribeToHolders(tokenAddress, callback) {
    const room = `${ROOM_TYPES.HOLDERS}:${tokenAddress}`;
    this.subscribe(room, callback);
  }

  /**
   * Subscribe to all token updates
   * @param {string} tokenAddress - Token address
   * @param {Function} callback - Update callback
   */
  subscribeToUpdates(tokenAddress, callback) {
    const room = `${ROOM_TYPES.TOKEN}:${tokenAddress}`;
    this.subscribe(room, callback);
  }
}

/**
 * Main WebSocket service class
 */
class WebSocketService {
  /**
   * @param {string} baseUrl - Base WebSocket URL without API key
   */
  constructor(baseUrl) {
    this.wsUrl = getWebSocketUrl(baseUrl);
    this.socket = null;
    this.transactionSocket = null;
    this.reconnectAttempts = 0;
    this.reconnectDelay = 2500;
    this.reconnectDelayMax = 4500;
    this.randomizationFactor = 0.5;
    this.emitter = new EventEmitter();
    this.subscribedRooms = new Set();
    this.transactions = new Set();
    this.isConnecting = false;
    this.maxReconnectAttempts = 10;

    // Initialize subscribers
    this.transactionSubscriber = new TransactionSubscriber(this);
    this.priceSubscriber = new PriceSubscriber(this);
    this.tokenSubscriber = new TokenSubscriber(this);

    this.connect();

    if (typeof process !== 'undefined') {
      process.on('beforeExit', () => this.disconnect());
    }
  }

  /**
   * Connect to the WebSocket server
   * @returns {Promise<void>}
   */
  async connect() {
    if (this.isConnecting || (this.socket?.readyState === WebSocket.OPEN && this.transactionSocket?.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;

    try {
      await Promise.all([
        this.createSocket('main'),
        this.createSocket('transaction')
      ]);

      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.resubscribeToRooms();
    } catch (error) {
      this.isConnecting = false;
      console.error('Failed to connect to WebSocket:', error);
      this.reconnect();
    }
  }

  /**
   * Create a new WebSocket connection
   * @param {string} type - Socket type ('main' or 'transaction')
   * @returns {Promise<void>}
   */
  createSocket(type) {
    return new Promise((resolve, reject) => {
      try {
        const socket = new WebSocket(this.wsUrl);

        socket.onopen = () => {
          console.log(`Connected to ${type} WebSocket`);
          if (type === 'main') {
            this.socket = socket;
          } else {
            this.transactionSocket = socket;
          }
          resolve();
        };

        socket.onclose = () => {
          console.log(`${type} WebSocket connection closed`);
          if (type === 'main') {
            this.socket = null;
          } else {
            this.transactionSocket = null;
          }
          this.reconnect();
        };

        socket.onerror = (error) => {
          console.error(`${type} WebSocket error:`, error);
          reject(error);
        };

        socket.onmessage = this.handleMessage.bind(this);

        // Set timeout for connection
        setTimeout(() => {
          if (socket.readyState !== WebSocket.OPEN) {
            socket.close();
            reject(new Error('WebSocket connection timeout'));
          }
        }, 10000);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Handle incoming WebSocket messages
   * @param {MessageEvent} event - WebSocket message event
   */
  handleMessage(event) {
    try {
      const message = JSON.parse(event.data);

      if (message.type === 'message') {
        // Deduplicate transactions
        if (message.data?.tx) {
          if (this.transactions.has(message.data.tx)) {
            return;
          }
          this.transactions.add(message.data.tx);
          // Keep transaction set size manageable
          if (this.transactions.size > 1000) {
            const iterator = this.transactions.values();
            for (let i = 0; i < 100; i++) {
              this.transactions.delete(iterator.next().value);
            }
          }
        }

        // Handle price updates
        if (message.room.includes('price:')) {
          this.emitter.emit(`price-by-token:${message.data.token}`, message.data);
        }

        // Emit the message to subscribers
        this.emitter.emit(message.room, message.data);
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  }

  /**
   * Reconnect to the WebSocket server
   */
  reconnect() {
    if (this.isConnecting || this.reconnectAttempts >= this.maxReconnectAttempts) {
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
      }
      return;
    }

    console.log(`Reconnecting to WebSocket (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);

    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts),
      this.reconnectDelayMax
    );
    const jitter = delay * this.randomizationFactor;
    const reconnectDelay = delay + Math.random() * jitter;

    setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, reconnectDelay);
  }

  /**
   * Join a WebSocket room
   * @param {string} room - Room name
   */
  joinRoom(room) {
    this.subscribedRooms.add(room);
    const socket = room.includes('transaction')
      ? this.transactionSocket
      : this.socket;

    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'join', room }));
    }
  }

  /**
   * Leave a WebSocket room
   * @param {string} room - Room name
   */
  leaveRoom(room) {
    this.subscribedRooms.delete(room);
    const socket = room.includes('transaction')
      ? this.transactionSocket
      : this.socket;

    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'leave', room }));
    }
  }

  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {Function} listener - Event listener
   */
  on(event, listener) {
    this.emitter.on(event, listener);
  }

  /**
   * Unsubscribe from an event
   * @param {string} event - Event name
   * @param {Function} listener - Event listener
   */
  off(event, listener) {
    this.emitter.off(event, listener);
  }

  /**
   * Resubscribe to all rooms after reconnection
   */
  resubscribeToRooms() {
    if (!this.socket || !this.transactionSocket) {
      return;
    }

    for (const room of this.subscribedRooms) {
      const socket = room.includes('transaction')
        ? this.transactionSocket
        : this.socket;

      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'join', room }));
      }
    }
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    if (this.transactionSocket) {
      this.transactionSocket.close();
      this.transactionSocket = null;
    }
    this.subscribedRooms.clear();
    this.transactions.clear();
    this.reconnectAttempts = 0;
  }

  /**
   * Get the main WebSocket instance
   * @returns {WebSocket|null}
   */
  getSocket() {
    return this.socket;
  }

  /**
   * Get the transaction WebSocket instance
   * @returns {WebSocket|null}
   */
  getTransactionSocket() {
    return this.transactionSocket;
  }
}

module.exports = {
  WebSocketService,
  TransactionSubscriber,
  PriceSubscriber,
  TokenSubscriber,
  ROOM_TYPES
}; 