FROM node:0-slim
EXPOSE 45634
COPY server /app/server
COPY rules /app/rules/
RUN useradd -d /app -M -s /bin/false app \
	&& cd /app/rules/ && npm install . \
	&& cd /app/server/ && npm install .
USER app
CMD ["node", "/app/server/server.js"]
