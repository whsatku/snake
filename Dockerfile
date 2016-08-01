FROM node:0-slim
EXPOSE 45634
COPY server /app/server
COPY rules /app/rules/
RUN cd /app/rules/ && npm install . \
	&& cd /app/server/ && npm install .
CMD ["node", "/app/server/server.js"]
